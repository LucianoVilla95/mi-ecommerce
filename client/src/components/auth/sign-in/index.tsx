'use client';
import { JSX, useActionState, useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signInUser } from './actions';
import { FormState } from '../sign-up/types';
import { useRouter } from 'next/navigation';
import { useSyncCart } from '@/hooks/use-sync-cart';
import { useCartStore } from '@/stores/cart.store';
import { CartItem } from '@/services/types';

const SignIn = (): JSX.Element => {
  const [state, formAction, isPending] = useActionState<null | FormState | void, FormData>(signInUser, null);
  const [password, setPassword] = useState<boolean>(false);
  const router = useRouter();
  const { mutate: syncCart } = useSyncCart();
  const hasSynced = useRef(false);
  const items: CartItem[] = useCartStore(state => state.items);

  useEffect(() => {
    if (!state?.success || hasSynced.current) return;
    hasSynced.current = true;

    if (items.length === 0) {
      router.push('/');
      return;
    }
    const timer = setTimeout(() => {
      syncCart(undefined, {
        onSuccess: () => {
          router.push('/');
        },
        onError: () => {
          router.push('/');
        }
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [state?.success, router, syncCart, items]);

  return (
    <main className="max-w-md mx-auto h-auto bg-gray-300 mt-24 px-6 py-6 border rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.50)]">
      <section className="mb-6">
        <h1 className="text-4xl font-bold leading-tight">
          Bienvenido
        </h1>
      </section>
      <form action={formAction} className="space-y-5">
        <div>
          <label className="text-sm font-medium">
            Correo electrónico
          </label>
          <input type="email" name="email" placeholder="ejemplo@gmail.com" className="mt-2 w-full h-14 rounded-2xl border bg-white px-5 outline-none focus:border-black" key={`email-${state?.fields?.email || ""}`} defaultValue={state?.fields?.email || ""} required/>
          {state?.errors?.email && (
            <p className="text-red-500">{state.errors.email[0]}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">
            Contraseña
          </label>
          <div className="mt-2 h-14 border bg-white rounded-2xl px-5 flex items-center">
            <input type={password ? "text" : "password"} name="password" placeholder="••••••••" className="flex-1 outline-none" key={`password-${state?.fields?.password || ""}`} defaultValue={state?.fields?.password || ""} required/>
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
        <div className="flex justify-end">
          <button type="button" className="text-sm text-neutral-500 cursor-pointer">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        {state?.success === false && (
          <p className="text-red-500 text-sm font-medium">{state.error}</p>
        )}
        <button className="w-full h-14 rounded-2xl bg-black text-white font-semibold text-lg mt-4 cursor-pointer transition-colors duration-200 hover:bg-gray-700">
          {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>
      <div className="flex items-center gap-4 my-10">
        <div className="h-px bg-neutral-200 flex-1" />
        <span className="text-neutral-400 text-sm">
          o continuar con
        </span>
        <div className="h-px bg-neutral-200 flex-1" />
      </div>
      <div className="space-y-4">
        <button className="w-full h-14 rounded-2xl border bg-white font-medium cursor-pointer transition-colors duration-200 hover:bg-black hover:text-white">
          Continuar con Google
        </button>
      </div>
      <div className="mt-10 text-center">
        <span className="text-neutral-500">
          ¿No tienes cuenta?
        </span>
        <Link href="/auth/signup" className="font-semibold ml-2">
          Crear cuenta
        </Link>
      </div>
    </main>
  )
}

export default SignIn;