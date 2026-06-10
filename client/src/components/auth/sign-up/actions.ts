'use server';

import { redirect } from "next/navigation";
import { FormState } from './types';
import { z } from 'zod';
import { registerSchema } from "./types";

export const signUpUser = async (statePrevious: FormState | void, formData: FormData): Promise<FormState | void> => {
  const data = Object.fromEntries(formData.entries());
  const validacion = registerSchema.safeParse(data);

  if (!validacion.success) {
    const { fieldErrors } = z.flattenError(validacion.error)

    return {
      success: false,
      errors: fieldErrors,
      fields: {
        name: data.name as string,
        email: data.email as string,
        password: data.password as string,
        phone: data.phone as string,
        country: data.country as string,
        address: data.address as string,
        city: data.city as string
      }
    }
  };

  let result: boolean = false;

  const {name, email, password, phone, country, address, city} = validacion.data;

  try {
    const response = await fetch('http://localhost:3001/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name, email, password, phone, country, address, city})
    })

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Error al registrarse',
        fields: { name, email, password, phone, country, address, city }
      };
    }

    result = true;

  } catch (error) {

    return {
      success: false,
      error: 'No se pudo conectar con el servidor',
      fields: { name, email, password, phone, country, address, city }
    };
  }

  if (result) {
    redirect('/auth/signin');
  }
};