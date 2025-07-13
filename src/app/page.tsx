"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, X, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description?: string;
  price: number;
  image?: string;
  rating?: number;
  reviews?: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("featured");

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const brands = Array.from(new Set(products.map((p) => p.brand)));

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://careeco-assignment.onrender.com/api/products");
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
        if (data.length) {
          const prices = data.map((p: Product) => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceRange([min, max]);
          setMaxPrice(max);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchSearchedProducts = async () => {
      setLoading(true);
      try {
        let url = "";

        if (selectedCategories.length === 1) {
          const category = encodeURIComponent(selectedCategories[0]);
          const q = encodeURIComponent(searchQuery.trim());
          url = `https://careeco-assignment.onrender.com/api/products/category/${category}?q=${q}`;
        } else if (searchQuery.trim()) {
          url = `https://careeco-assignment.onrender.com/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`;
        } else {
          url = "https://careeco-assignment.onrender.com/api/products";
        }

        const res = await fetch(url);
        const data = await res.json();
        setFilteredProducts(data);

        if (data.length === 0 && searchQuery.trim()) {
          const suggestRes = await fetch(`https://careeco-assignment.onrender.com/api/products/suggest?q=${encodeURIComponent(searchQuery.trim())}`);
          const suggestData = await suggestRes.json();
          setSuggestions(suggestData);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchedProducts();
  }, [searchQuery, selectedCategories]);

  useEffect(() => {
    const filtered = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategories.length || selectedCategories.includes(p.category);
      const matchesBrand = !selectedBrands.length || selectedBrands.includes(p.brand);
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategories, selectedBrands, priceRange, sortBy]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) =>
      checked ? [...prev, brand] : prev.filter((b) => b !== brand)
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    if (products.length) {
      const prices = products.map((p) => p.price);
      setPriceRange([Math.min(...prices), Math.max(...prices)]);
    }
    setSearchQuery("");
    setSuggestions([]);
  };

  const removeFilter = (type: 'category' | 'brand', value: string) => {
    if (type === 'category') {
      setSelectedCategories(prev => prev.filter(c => c !== value));
    } else {
      setSelectedBrands(prev => prev.filter(b => b !== value));
    }
  };

  const getSortLabel = (value: string) => {
    switch (value) {
      case 'featured': return 'Featured';
      case 'name': return 'Name A-Z';
      case 'price-low': return 'Price: Low to High';
      case 'price-high': return 'Price: High to Low';
      case 'rating': return 'Highest Rated';
      default: return 'Sort';
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><span>Price Range</span><Badge variant="outline" className="text-xs">${priceRange[0]} - ${priceRange[1]}</Badge></h3>
        <Slider value={priceRange} onValueChange={setPriceRange} max={maxPrice} min={0} step={1} className="mb-3" />
        <div className="flex justify-between text-sm text-gray-500"><span>$0</span><span>${maxPrice}</span></div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><span>Categories</span>{selectedCategories.length > 0 && (<Badge variant="secondary" className="text-xs">{selectedCategories.length}</Badge>)}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center space-x-3"><Checkbox id={`cat-${cat}`} checked={selectedCategories.includes(cat)} onCheckedChange={(checked) => handleCategoryChange(cat, checked as boolean)} /><Label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">{cat}</Label></div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><span>Brands</span>{selectedBrands.length > 0 && (<Badge variant="secondary" className="text-xs">{selectedBrands.length}</Badge>)}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map((br) => (
            <div key={br} className="flex items-center space-x-3"><Checkbox id={`br-${br}`} checked={selectedBrands.includes(br)} onCheckedChange={(checked) => handleBrandChange(br, checked as boolean)} /><Label htmlFor={`br-${br}`} className="text-sm cursor-pointer">{br}</Label></div>
          ))}
        </div>
      </div>
      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (<Button variant="outline" onClick={clearFilters} className="w-full">Clear All Filters</Button>)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8"><h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Discover Amazing Products</h1><p className="text-gray-600 text-lg">Find exactly what you're looking for</p></div>
        <div className="relative max-w-2xl mx-auto"><Search className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" /><Input placeholder="Search for products, brands, or categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.currentTarget.value)} className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm" /></div>
      </div>
      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
        <div className="container mx-auto px-4 pb-4"><div className="flex flex-wrap gap-2 items-center"><span className="text-sm text-gray-600 font-medium">Active filters:</span>{selectedCategories.map((cat) => (<Badge key={cat} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer" onClick={() => removeFilter('category', cat)}>{cat}<X className="ml-1 h-3 w-3" /></Badge>))}{selectedBrands.map((brand) => (<Badge key={brand} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer" onClick={() => removeFilter('brand', brand)}>{brand}<X className="ml-1 h-3 w-3" /></Badge>))}</div></div>
      )}
      <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-80 hidden lg:block">
          <Card className="bg-white/80 backdrop-blur-sm border-white/60 shadow-lg"><CardContent className="p-6"><div className="flex items-center gap-2 mb-6"><Filter className="h-5 w-5 text-gray-600" /><h2 className="text-lg font-semibold">Filters</h2></div><FilterContent /></CardContent></Card>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" className="lg:hidden"><Filter className="h-4 w-4 mr-2" />Filters{(selectedCategories.length + selectedBrands.length > 0) && (<Badge className="ml-2 bg-blue-500 text-white">{selectedCategories.length + selectedBrands.length}</Badge>)}</Button></SheetTrigger>
              <SheetContent side="left" className="w-80"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="mt-6"><FilterContent /></div></SheetContent>
            </Sheet>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600"><ShoppingBag className="h-4 w-4" /><span>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</span></div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[140px]">{getSortLabel(sortBy)}<ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent><DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}><DropdownMenuRadioItem value="featured">Featured</DropdownMenuRadioItem><DropdownMenuRadioItem value="name">Name A-Z</DropdownMenuRadioItem><DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem><DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem><DropdownMenuRadioItem value="rating">Highest Rated</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (<Card key={i} className="bg-white/80 backdrop-blur-sm"><CardContent className="p-6"><Skeleton className="h-48 w-full mb-4 rounded-lg" /><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-white/60 shadow-lg">
              <CardContent className="text-center p-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                <Button onClick={clearFilters} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">Clear All Filters</Button>
                {suggestions.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center justify-center gap-2 mb-6"><Sparkles className="h-5 w-5 text-yellow-500" /><h3 className="text-lg font-semibold">You might also like:</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {suggestions.map((prod) => (<ProductCard key={prod._id} product={prod} />))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (<ProductCard key={product._id} product={product} />))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}