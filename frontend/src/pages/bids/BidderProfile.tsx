import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Save, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useUIStore } from '../../store/uiStore';
import bidService, { type BidderFormData } from '../../services/bidService';
import type { Bidder } from '../../types';

const bidderSchema = z.object({
  company_name: z.string().min(3, 'Company name must be at least 3 characters'),
  registration_number: z.string().optional(),
  pan_number: z.string().optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  pincode: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  established_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  annual_turnover: z.number().min(0).optional(),
  employee_count: z.number().min(1).optional(),
  is_msme: z.boolean().default(false),
  is_startup: z.boolean().default(false)
});

type BidderFormValues = z.infer<typeof bidderSchema>;

const BidderProfile: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [existingProfile, setExistingProfile] = React.useState<Bidder | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BidderFormValues>({
    resolver: zodResolver(bidderSchema) as any,
    defaultValues: {
      country: 'India',
      is_msme: false,
      is_startup: false
    }
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await bidService.getBidderProfile();
        setExistingProfile(profile);
        reset({
          company_name: profile.company_name,
          registration_number: profile.registration_number || '',
          pan_number: profile.pan_number || '',
          gst_number: profile.gst_number || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || 'India',
          pincode: profile.pincode || '',
          website: profile.website || '',
          established_year: profile.established_year || undefined,
          annual_turnover: profile.annual_turnover || undefined,
          employee_count: profile.employee_count || undefined,
          is_msme: profile.is_msme || false,
          is_startup: profile.is_startup || false
        });
      } catch (error: any) {
        if (error.response?.status !== 404) {
          addToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to load profile'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset, addToast]);

  const onSubmit = async (data: BidderFormValues) => {
    setSaving(true);
    try {
      const formData: BidderFormData = {
        ...data,
        website: data.website || undefined
      };

      if (existingProfile) {
        await bidService.updateBidderProfile(formData);
        addToast({
          type: 'success',
          title: 'Updated',
          message: 'Bidder profile updated successfully'
        });
      } else {
        await bidService.createBidderProfile(formData);
        addToast({
          type: 'success',
          title: 'Created',
          message: 'Bidder profile created successfully'
        });
        navigate('/bids');
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to save profile'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading profile..." />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'My Bids', path: '/bids' },
          { label: 'Bidder Profile' }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {existingProfile ? 'Edit Bidder Profile' : 'Create Bidder Profile'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {existingProfile
            ? 'Update your company information'
            : 'Complete your bidder profile to start submitting bids'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Company Name *"
                  placeholder="Enter your company name"
                  error={errors.company_name?.message}
                  {...register('company_name')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Registration Number"
                    placeholder="Company registration number"
                    {...register('registration_number')}
                  />
                  <Input
                    label="Year Established"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    placeholder="e.g., 2010"
                    error={errors.established_year?.message}
                    {...register('established_year', { valueAsNumber: true })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="PAN Number"
                    placeholder="Company PAN"
                    {...register('pan_number')}
                  />
                  <Input
                    label="GST Number"
                    placeholder="GST registration number"
                    {...register('gst_number')}
                  />
                </div>

                <Input
                  label="Website"
                  type="url"
                  placeholder="https://www.example.com"
                  error={errors.website?.message}
                  {...register('website')}
                />
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Street Address"
                  placeholder="Enter full address"
                  {...register('address')}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    placeholder="City"
                    {...register('city')}
                  />
                  <Input
                    label="State"
                    placeholder="State"
                    {...register('state')}
                  />
                  <Input
                    label="Pincode"
                    placeholder="Pincode"
                    {...register('pincode')}
                  />
                </div>

                <Input
                  label="Country"
                  placeholder="Country"
                  {...register('country')}
                />
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Annual Turnover (INR)"
                    type="number"
                    min="0"
                    placeholder="e.g., 10000000"
                    {...register('annual_turnover', { valueAsNumber: true })}
                  />
                  <Input
                    label="Number of Employees"
                    type="number"
                    min="1"
                    placeholder="e.g., 50"
                    {...register('employee_count', { valueAsNumber: true })}
                  />
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      {...register('is_msme')}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      MSME Registered
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      {...register('is_startup')}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      DPIIT Recognized Startup
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            {existingProfile && (
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-center font-medium text-gray-900">
                    Profile Verified
                  </p>
                  <p className="text-center text-sm text-gray-500 mt-1">
                    You can submit bids for tenders
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>
                  Your bidder profile is required to submit bids on tenders.
                </p>
                <p>
                  Make sure your company information is accurate and up-to-date.
                </p>
                <p>
                  MSME and Startup certifications may provide preference in certain tenders.
                </p>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              loading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              {existingProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BidderProfile;
