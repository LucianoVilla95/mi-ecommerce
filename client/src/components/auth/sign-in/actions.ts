'use server';

import { z } from 'zod';
import { FormState } from '../sign-up/types';
import { registerSchema } from '../sign-up/types';
import { cookies } from 'next/headers';

const loginSchema = registerSchema.pick({ email: true, password: true });

const extractHeaderToken = (header: string): string => {
  const match = header.match(/access_token=([^;]+)/);
  
  return match ? match[1].trim() : '';
}

export const signInUser = async (statePrevious: FormState | void, formData: FormData): Promise<FormState | void> => {
  const data = Object.fromEntries(formData.entries());
  const validacion = loginSchema.safeParse(data);
  
  if (!validacion.success) {
    const { fieldErrors } = z.flattenError(validacion.error)
  
    return {
      success: false,
      errors: fieldErrors,
      fields: {
        email: data.email as string,
        password: data.password as string,
      }
    }
  };
  
  const {email, password} = validacion.data;
  
  try {
    const response = await fetch('http://localhost:3001/users/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password}),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Error al iniciar sesión',
        fields: { email, password }
      };
    }

    const setCookieHeader = response.headers.get('set-cookie');
    
    if (setCookieHeader) {
      const token = extractHeaderToken(setCookieHeader);

      const cookieStore = await cookies();
      cookieStore.set('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
    }
    
    return {
      success: true,
    };
  
    } catch (error) {
  
      return {
        success: false,
        error: 'No se pudo conectar con el servidor',
        fields: { email, password }
      };
    }
};