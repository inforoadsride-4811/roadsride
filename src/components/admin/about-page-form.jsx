'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Image as ImageIcon, Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { updateAboutPageData } from '@/actions/about';
import { uploadFile, deleteFile, BUCKETS } from '@/lib/storage';

export default function AboutPageForm({ initialData = null }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const getInitialFormState = () => ({
    title: initialData?.title || 'Upgrade Your Ride, Drive Smart',
    introText: initialData?.introText || '',
    heroImage: initialData?.heroImage || '',
    secondaryImage: initialData?.secondaryImage || '',
    teamMembers: initialData?.teamMembers || [],
    features: initialData?.features || [],
  });

  const [formData, setFormData] = useState(getInitialFormState());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const { success, url, error } = await uploadFile(file, BUCKETS.STORE, 'about/');
    if (success) {
      if (formData[field]) {
        await deleteFile(formData[field], BUCKETS.STORE);
      }
      setFormData({ ...formData, [field]: url });
      addToast({ title: 'Image uploaded', type: 'success' });
    } else {
      addToast({ title: 'Upload failed', message: error, type: 'error' });
    }
    setLoading(false);
  };

  // Team Members
  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [...formData.teamMembers, { name: '', role: '', image: '' }]
    });
  };

  const updateTeamMember = (index, field, value) => {
    const newMembers = [...formData.teamMembers];
    newMembers[index][field] = value;
    setFormData({ ...formData, teamMembers: newMembers });
  };

  const removeTeamMember = async (index) => {
    const newMembers = [...formData.teamMembers];
    if (newMembers[index].image) {
      await deleteFile(newMembers[index].image, BUCKETS.STORE);
    }
    newMembers.splice(index, 1);
    setFormData({ ...formData, teamMembers: newMembers });
  };

  const handleTeamMemberImage = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const { success, url, error } = await uploadFile(file, BUCKETS.STORE, 'about/team/');
    if (success) {
      if (formData.teamMembers[index].image) {
        await deleteFile(formData.teamMembers[index].image, BUCKETS.STORE);
      }
      updateTeamMember(index, 'image', url);
    } else {
      addToast({ title: 'Upload failed', message: error, type: 'error' });
    }
    setLoading(false);
  };

  // Features
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { title: '', description: '', icon: '' }]
    });
  };

  const updateFeature = (index, field, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index][field] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateAboutPageData(formData);
    if (res.success) {
      addToast({ title: 'About page saved successfully', type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Error saving data', message: res.error, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Intro Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">Main Introduction</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="e.g. Upgrade Your Ride, Drive Smart"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Introduction Text</label>
          <textarea
            name="introText"
            value={formData.introText}
            onChange={handleChange}
            rows={6}
            className="w-full flex rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="At RoadsRide, we are passionate about enhancing your driving experience..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Main Hero Image</label>
            {formData.heroImage ? (
              <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border">
                <img src={formData.heroImage} alt="Hero" className="w-full h-full object-cover" />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => setFormData({ ...formData, heroImage: '' })}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> hero image</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImage')} />
              </label>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Image (Optional)</label>
            {formData.secondaryImage ? (
              <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border">
                <img src={formData.secondaryImage} alt="Secondary" className="w-full h-full object-cover" />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => setFormData({ ...formData, secondaryImage: '' })}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> secondary image</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'secondaryImage')} />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold">Features & Highlights</h2>
          <Button type="button" onClick={addFeature} variant="outline" size="sm">
            <Plus size={16} className="mr-2" /> Add Feature
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-4 p-4 border rounded-lg bg-gray-50 relative">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeFeature(index)}
              >
                <Trash2 size={16} />
              </Button>
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-4 pr-8">
                  <div>
                    <label className="block text-xs font-medium mb-1">Title</label>
                    <Input 
                      value={feature.title} 
                      onChange={(e) => updateFeature(index, 'title', e.target.value)} 
                      placeholder="e.g. Premium Quality"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Icon (Lucide name, optional)</label>
                    <Input 
                      value={feature.icon} 
                      onChange={(e) => updateFeature(index, 'icon', e.target.value)} 
                      placeholder="e.g. Shield, Star, Car"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full flex rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Brief description..."
                  />
                </div>
              </div>
            </div>
          ))}
          {formData.features.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4 border rounded-lg border-dashed">No features added yet.</p>
          )}
        </div>
      </div>

      {/* Team Members Section */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold">Team Members</h2>
          <Button type="button" onClick={addTeamMember} variant="outline" size="sm">
            <Plus size={16} className="mr-2" /> Add Team Member
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {formData.teamMembers.map((member, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm space-y-4 relative">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 z-10 text-red-500 hover:bg-red-50"
                onClick={() => removeTeamMember(index)}
              >
                <Trash2 size={16} />
              </Button>
              
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border relative">
                {member.image ? (
                  <>
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm" 
                      className="absolute bottom-2 right-2"
                      onClick={() => updateTeamMember(index, 'image', '')}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-50 transition-colors">
                    <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                    <span className="text-xs text-gray-500">Upload Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleTeamMemberImage(e, index)} />
                  </label>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <Input 
                    value={member.name} 
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)} 
                    placeholder="e.g. Tabish"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Role</label>
                  <Input 
                    value={member.role} 
                    onChange={(e) => updateTeamMember(index, 'role', e.target.value)} 
                    placeholder="e.g. Co-Founder"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {formData.teamMembers.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8 border rounded-lg border-dashed">No team members added yet.</p>
        )}
      </div>

      <div className="pt-6 border-t flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Save About Page
        </Button>
      </div>
    </form>
  );
}
