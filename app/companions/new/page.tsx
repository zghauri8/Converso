import CompanionForm from '@/components/CompanionForm'
import { newCompanionPermissions } from '@/lib/actions/companion.action';
import { auth } from '@clerk/nextjs/server'
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

const NewCompanion = async () => {

  const { userId } = await auth();
  if(!userId) redirect('/sign-in')

    const canCreateCompanion = await newCompanionPermissions()

  return (
    <main className='min-h-screen flex items-center justify-center p-4'>
     {canCreateCompanion ? ( 
      <article className='w-full max-w-2xl flex flex-col gap-4'>
        <h1 className='text-3xl font-bold text-center mb-6'>Companion Builder</h1>
        <CompanionForm />
      </article>
     ) : (
      <article className='companion-limit'>
         <Image src="/images/limit.svg" alt='Companion Limit Reached'
         width={360}
         height={230}
         />
         <div className='cta-badge'>
            Upgrade Your Plan
         </div>
         <h1>You've Reached Your Limit</h1>
         <p>You've reached your companion limit. Upgrade to create more companions and premium features.</p>
         <Link href="/subscription" className='btn-primary w-2/3 justify-center'>
           Upgrade My Plan
         </Link>
      </article>
     )}
     
    </main>
  )
}

export default NewCompanion