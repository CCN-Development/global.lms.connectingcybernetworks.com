import React from 'react'
import StudentLayout from '@/layouts/StudentLayout';
import StudentHeader from '@/layouts/StudentHeader';

type Props = {}

export default function page({ }: Props) {
    return (
        <StudentLayout
            header={<StudentHeader title={
                <div className='text-lg text-gray-300'>
                    Hi, <span className='font-semibold'>Shiva</span>
                </div>
            } />}
        >
            <></>
        </StudentLayout>
    )
}