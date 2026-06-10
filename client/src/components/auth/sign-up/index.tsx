'use client';

import { JSX, useActionState, useState } from 'react';
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signUpUser } from './actions';
import { FormState } from './types';

const SignUp = (): JSX.Element => {
  const [state, formAction, isPending] = useActionState<null | FormState | void, FormData>(signUpUser, null);
  const [password, setPassword] = useState<boolean>(false);

  return (
    <main className="max-w-4xl mx-auto h-auto bg-gray-300 px-6 py-6 mt-20 border rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.50)]">
      <section className="mb-6">
        <h1 className="text-4xl font-bold leading-tight">
          Crear cuenta
        </h1>
      </section>
      <form action={formAction} className="space-y-0.5 grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium">
            Nombre completo
          </label>
          <input type="text" name="name" placeholder="Juan Pérez" required className="mt-2 w-full h-14 rounded-2xl border bg-white px-5 outline-none focus:border-black" key={`name-${state?.fields?.name || ""}`} defaultValue={state?.fields?.name || ""}/>
          {state?.errors?.name && (
            <p className="text-red-500">{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">
            Correo electrónico
          </label>
          <input type="email" name="email" placeholder="ejemplo@gmail.com" required className="mt-2 w-full h-14 rounded-2xl border bg-white px-5 outline-none focus:border-black" key={`email-${state?.fields?.email || ""}`} defaultValue={state?.fields?.email || ""}/>
          {state?.errors?.email && (
            <p className="text-red-500">{state.errors.email[0]}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">
            Contraseña
          </label>
          <div className="mt-2 h-14 border bg-white rounded-2xl px-5 flex items-center">
            <input type={password ? "text" : "password"} name="password" placeholder="••••••••" required className="flex-1 outline-none" key={`password-${state?.fields?.password || ""}`} defaultValue={state?.fields?.password || ""}/>
            <button type="button" onClick={() => setPassword(!password)}>
              {password ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {state?.errors?.password && (
            <ul className="text-red-500">
              {state.errors.password.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">
            Telefono
          </label>
          <input type="text" name="phone" placeholder="Ej: +54 9 388 123 4567" required className="mt-2 w-full h-14 rounded-2xl border bg-white px-5 outline-none focus:border-black" key={`phone-${state?.fields?.phone || ""}`} defaultValue={state?.fields?.phone || ""}/>
          {state?.errors?.phone && (
            <p className="text-red-500">{state.errors.phone[0]}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">
            Pais
          </label>
          <input type="text" name="country" required className="mt-2 w-full h-14 rounded-2xl border bg-white px-5 outline-none focus:border-black" key={`country-${state?.fields?.country || ""}`} defaultValue={state?.fields?.country || ""}/>
          {state?.errors?.country && (
            <p className="text-red-500">{state.errors.country[0]}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">
            Direccion
          </label>
          <input type="text" name="address" required className="mt-2 w-full h-14 rounded-2xl border bg-white px-5 outline-none focus:border-black" key={`address-${state?.fields?.address || ""}`} defaultValue={state?.fields?.address || ""}/>
          {state?.errors?.address && (
            <p className="text-red-500">{state.errors.address[0]}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">
            Ciudad
          </label>
          <input type="text" name="city" required className="mt-2 w-full h-14 rounded-2xl border bg-white px-5 outline-none focus:border-black" key={`city-${state?.fields?.city || ""}`} defaultValue={state?.fields?.city || ""}/>
          {state?.errors?.city && (
            <p className="text-red-500">{state.errors.city[0]}</p>
          )}
        </div>
        <div className="flex items-start gap-3">
          <input type="checkbox" className="mt-1"/>
          <p className="text-sm text-neutral-500">
            Acepto términos y condiciones
          </p>
        </div>
        {state?.success === false && (
          <p className="text-red-500 text-sm font-medium">{state.error}</p>
        )}
        <button disabled={isPending} className="w-full max-w-sm h-14 rounded-2xl bg-black text-white font-semibold text-lg col-span-2 justify-self-center cursor-pointer transition-colors duration-200 hover:bg-gray-700">
          {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <div className="mt-10 text-center">
        <span className="text-neutral-500">
          ¿Ya tienes cuenta?
        </span>
        <Link href="/auth/signin" className="font-semibold ml-2">
          Iniciar sesión
        </Link>
      </div>
    </main>
  )
}

export default SignUp;