import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import { manufacturerAPI } from '../services/api';
import { toast } from 'sonner';
import { type Blanket } from '../types';
import { ImageUpload } from '../components/products/IMageUplaod';

// Form data interface
interface ProductFormData {
  name: string;
  quantity: number;
  material: string;
  size: string;
  color: string;
  price: number;
}

export const Products: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Blanket | null>(null);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  
  // Form state to preserve data across tabs
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    quantity: 0,
    material: '',
    size: '',
    color: '',
    price: 0
  });
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['blankets'],
    queryFn: () => manufacturerAPI.getBlankets(),
  });

  const createMutation = useMutation({
    mutationFn: (formDataToSend: FormData) => manufacturerAPI.createBlanket(formDataToSend as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blankets'] });
      closeDialog();
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formDataToSend }: { id: number; formDataToSend: FormData }) => 
      manufacturerAPI.updateBlanketWithImages(id, formDataToSend as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blankets'] });
      closeDialog();
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => manufacturerAPI.deleteBlanket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blankets'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  // Reset all form states
  const resetForm = () => {
    setEditingProduct(null);
    setFrontImage(null);
    setBackImage(null);
    setActiveTab('basic');
    setFormData({
      name: '',
      quantity: 0,
      material: '',
      size: '',
      color: '',
      price: 0
    });
  };

  // Close dialog and reset form
  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // Open dialog for adding new product
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open dialog for editing product
  const openEditDialog = (product: Blanket) => {
    setEditingProduct(product);
    setFrontImage(null);
    setBackImage(null);
    setActiveTab('basic');
    setFormData({
      name: product.name,
      quantity: product.quantity,
      material: product.material,
      size: product.size,
      color: product.color,
      price: product.price
    });
    setIsDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    // Append form fields
    formDataToSend.append('name', formData.name);
    formDataToSend.append('quantity', formData.quantity.toString());
    formDataToSend.append('material', formData.material);
    formDataToSend.append('size', formData.size);
    formDataToSend.append('color', formData.color);
    formDataToSend.append('price', formData.price.toString());
    
    // Add images if they exist
    if (frontImage) {
      formDataToSend.append('front_image', frontImage);
    }
    if (backImage) {
      formDataToSend.append('back_image', backImage);
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, formDataToSend });
    } else {
      createMutation.mutate(formDataToSend);
    }
  };

  const blankets: Blanket[] = data?.data?.blankets || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your blanket inventory with images</p>
        </div>
        <Button 
          className="bg-gray-900 hover:bg-gray-800"
          onClick={openAddDialog}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) closeDialog();
        else setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Product Images</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                    placeholder="e.g., Cozy Comfort Deluxe"
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input 
                    id="quantity" 
                    name="quantity"
                    type="number" 
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required 
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="material">Material *</Label>
                  <Input 
                    id="material" 
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    required 
                    placeholder="e.g., Cotton, Wool, Fleece"
                  />
                </div>
                
                <div>
                  <Label htmlFor="size">Size *</Label>
                  <Input 
                    id="size" 
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required 
                    placeholder="e.g., Twin, Queen, King"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <Input 
                    id="color" 
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    required 
                    placeholder="e.g., Beige, Gray, Navy"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input 
                    id="price" 
                    name="price"
                    type="number" 
                    step="0.01" 
                    value={formData.price}
                    onChange={handleInputChange}
                    required 
                    min="0"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="images" className="space-y-4 mt-4">
                <ImageUpload
                  label="Front Image"
                  onImageSelect={setFrontImage}
                  existingImage={editingProduct?.front_image ? `http://localhost:5000${editingProduct.front_image}` : null}
                  aspectRatio="square"
                />
                
                <ImageUpload
                  label="Back Image"
                  onImageSelect={setBackImage}
                  existingImage={editingProduct?.back_image ? `http://localhost:5000${editingProduct.back_image}` : null}
                  aspectRatio="square"
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Upload high-quality images for better product presentation. 
                    Supported formats: PNG, JPG, JPEG (Max 5MB)
                  </p>
                </div>
              </TabsContent>
              
              <div className="flex gap-2 mt-6">
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                {activeTab === 'basic' && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab('images')}
                  >
                    Next →
                  </Button>
                )}
              </div>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blankets.map((blanket) => (
                    <TableRow key={blanket.id}>
                      <TableCell>
                        {blanket.front_image ? (
                          <img
                            src={`http://localhost:5000${blanket.front_image}`}
                            alt={blanket.name}
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <Image className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{blanket.name}</TableCell>
                      <TableCell>{blanket.material}</TableCell>
                      <TableCell>{blanket.size}</TableCell>
                      <TableCell>{blanket.color}</TableCell>
                      <TableCell>${blanket.price}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          blanket.quantity < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {blanket.quantity} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(blanket)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this product?')) {
                                deleteMutation.mutate(blanket.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};