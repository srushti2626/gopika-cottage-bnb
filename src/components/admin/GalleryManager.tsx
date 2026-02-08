import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Upload, GripVertical } from "lucide-react";
import { getSafeErrorMessage } from "@/lib/errorUtils";

interface GalleryPhoto {
  id: string;
  image_url: string;
  alt_text: string;
  caption: string | null;
  display_order: number;
  span_class: string | null;
  is_active: boolean;
}

export function GalleryManager() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [spanClass, setSpanClass] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchPhotos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast.error(getSafeErrorMessage(error, "fetching photos"));
    } else {
      setPhotos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const resetForm = () => {
    setImageUrl("");
    setAltText("");
    setCaption("");
    setSpanClass("");
    setIsActive(true);
    setEditingPhoto(null);
  };

  const openEditDialog = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setImageUrl(photo.image_url);
    setAltText(photo.alt_text);
    setCaption(photo.caption || "");
    setSpanClass(photo.span_class || "");
    setIsActive(photo.is_active);
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery-images")
      .upload(fileName, file);

    if (uploadError) {
      toast.error(getSafeErrorMessage(uploadError, "uploading image"));
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("gallery-images")
      .getPublicUrl(fileName);

    setImageUrl(publicUrl.publicUrl);
    setUploading(false);
    toast.success("Image uploaded successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl || !altText) {
      toast.error("Image URL and alt text are required");
      return;
    }

    const photoData = {
      image_url: imageUrl,
      alt_text: altText,
      caption: caption || null,
      span_class: spanClass || "",
      is_active: isActive,
      display_order: editingPhoto?.display_order ?? photos.length,
    };

    if (editingPhoto) {
      const { error } = await supabase
        .from("gallery_photos")
        .update(photoData)
        .eq("id", editingPhoto.id);

      if (error) {
        toast.error(getSafeErrorMessage(error, "updating photo"));
        return;
      }
      toast.success("Photo updated successfully");
    } else {
      const { error } = await supabase
        .from("gallery_photos")
        .insert(photoData);

      if (error) {
        toast.error(getSafeErrorMessage(error, "adding photo"));
        return;
      }
      toast.success("Photo added successfully");
    }

    setDialogOpen(false);
    resetForm();
    fetchPhotos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    const { error } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(getSafeErrorMessage(error, "deleting photo"));
      return;
    }

    toast.success("Photo deleted successfully");
    fetchPhotos();
  };

  const toggleActive = async (photo: GalleryPhoto) => {
    const { error } = await supabase
      .from("gallery_photos")
      .update({ is_active: !photo.is_active })
      .eq("id", photo.id);

    if (error) {
      toast.error(getSafeErrorMessage(error, "updating photo"));
      return;
    }

    fetchPhotos();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gallery Photos</h3>
          <p className="text-sm text-muted-foreground">
            Manage photos displayed in the gallery section
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPhoto ? "Edit Photo" : "Add New Photo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
                {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {imageUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}

              <div className="space-y-2">
                <Label>Alt Text *</Label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption shown on hover"
                />
              </div>

              <div className="space-y-2">
                <Label>Layout Size</Label>
                <Select value={spanClass} onValueChange={setSpanClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Normal</SelectItem>
                    <SelectItem value="md:col-span-2">Wide (2 columns)</SelectItem>
                    <SelectItem value="md:col-span-2 md:row-span-2">Large (2x2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>Active (visible on site)</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingPhoto ? "Update" : "Add"} Photo
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No photos added yet. Click "Add Photo" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className={`overflow-hidden ${!photo.is_active ? "opacity-50" : ""}`}>
              <div className="relative aspect-square">
                <img
                  src={photo.image_url}
                  alt={photo.alt_text}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => openEditDialog(photo)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(photo.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{photo.caption || photo.alt_text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${photo.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {photo.is_active ? "Active" : "Hidden"}
                  </span>
                  <Switch
                    checked={photo.is_active}
                    onCheckedChange={() => toggleActive(photo)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}