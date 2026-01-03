import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import authService from '../../services/authService';
import { useUIStore } from '../../store/uiStore';
import { colors, shadows } from '../../styles/constants';

// Strong password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    ),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password']
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authService.register({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'Bidder' // Default role for self-registration
      });
      addToast({
        type: 'success',
        title: 'Registration successful',
        message: 'Please login with your credentials'
      });
      navigate('/login');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Registration failed',
        message: err.response?.data?.detail || 'Please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 16px'
      }}
    >
      {/* Header Section */}
      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: colors.primary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>A</span>
          </div>
        </div>

        <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
          Create your account
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Register as a Bidder on ATEMS
        </p>
      </div>

      {/* Form Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          margin: '32px auto 0',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: shadows.govtLg,
          border: '1px solid #e5e7eb',
          padding: '32px 24px'
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            icon={<User className="w-5 h-5" />}
            error={errors.full_name?.message}
            required
            {...register('full_name')}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="Enter your email"
            icon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            icon={<Phone className="w-5 h-5" />}
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            icon={<Lock className="w-5 h-5" />}
            error={errors.password?.message}
            helperText="Min 8 chars with uppercase, lowercase, number & special character"
            required
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            icon={<Lock className="w-5 h-5" />}
            error={errors.confirm_password?.message}
            required
            {...register('confirm_password')}
          />

          <Button type="submit" className="w-full" loading={isLoading}>
            Create Account
          </Button>
        </form>

        <div style={{ marginTop: '24px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '100%', height: '1px', backgroundColor: '#e5e7eb' }} />
            <span style={{ position: 'relative', backgroundColor: 'white', padding: '0 8px', fontSize: '14px', color: '#6b7280' }}>
              Already have an account?
            </span>
          </div>

          <div style={{ marginTop: '24px' }}>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Sign in instead
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <p style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        Government of India - Secure Portal
      </p>
    </div>
  );
};

export default Register;
