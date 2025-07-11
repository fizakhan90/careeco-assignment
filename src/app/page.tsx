"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, ChevronDown } from "lucide-react";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const brands = Array.from(new Set(products.map((p) => p.brand)));

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/products");
        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Fetched products:", data);
        setProducts(data);
        setFilteredProducts(data);
        if (data.length) {
          const prices = data.map((p: Product) => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceRange([min, max]);
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
    if (!searchQuery.trim()) {
      setFilteredProducts(products); // Show all if query is empty
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setFilteredProducts(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  fetchSearchedProducts();
}, [searchQuery, products]);


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
      default:
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
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        {categories.map((cat) => (
          <div key={cat} className="flex items-center space-x-3">
            <Checkbox
              id={`cat-${cat}`}
              checked={selectedCategories.includes(cat)}
              onCheckedChange={(checked) => handleCategoryChange(cat, checked as boolean)}
            />
            <Label htmlFor={`cat-${cat}`}>{cat}</Label>
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        {brands.map((br) => (
          <div key={br} className="flex items-center space-x-3">
            <Checkbox
              id={`br-${br}`}
              checked={selectedBrands.includes(br)}
              onCheckedChange={(checked) => handleBrandChange(br, checked as boolean)}
            />
            <Label htmlFor={`br-${br}`}>{br}</Label>
          </div>
        ))}
      </div>
      {(selectedCategories.length || selectedBrands.length) > 0 && (
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            className="pl-12"
          />
        </div>
      </div>

      {/* Filters & Sort Controls */}
      <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 hidden lg:block">
          <Card>
            <CardContent>
              <FilterContent />
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Filter products</SheetDescription>
                </SheetHeader>
                <FilterContent />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Sort <ChevronDown className="ml-2" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <DropdownMenuRadioItem value="featured">Featured</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">Name A-Z</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rating">Highest Rated</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
              >
                <Grid />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
              >
                <List />
              </Button>
            </div>
          </div>

          {/* Product Listing */}
          {loading ? (
            <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"} gap-6`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><CardContent><Skeleton className="h-48 w-full mb-4" /><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card><CardContent className="text-center p-16">
              <div className="text-4xl mb-4">🔍</div>
              <p>No products found</p>
              <Button onClick={clearFilters} className="mt-4">Clear Filters</Button>
            </CardContent></Card>
          ) : (
            <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"} gap-6`}>
              {filteredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
