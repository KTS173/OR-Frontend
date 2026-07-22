import { Eye, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden bg-[#082f68] lg:block">
        <img src="/assets/images/login.png" alt="โรงพยาบาลกรุงเทพ" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#062c63]/95 via-[#073a78]/80 to-[#073a78]/35" />
        <div className="relative flex h-full max-w-2xl flex-col justify-between p-14 text-white">
          <div><img src="/assets/images/logo1.png" alt="BDMS" className="h-14 w-auto brightness-0 invert" /><p className="mt-2 text-xs tracking-[0.15em] text-blue-100">BANGKOK DUSIT MEDICAL SERVICES</p></div>
          <div>
            <p className="text-sm font-medium text-blue-200">OR SMART SSI</p>
            <h1 className="mt-3 text-4xl leading-tight font-bold">ระบบติดตามภาวะแผล<br />ติดเชื้อหลังผ่าตัด</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100/85">ช่วยเฝ้าระวังและติดตามผู้ป่วยหลังการผ่าตัดอย่างเป็นระบบ ลดภาระงานซ้ำซ้อน และเพิ่มความปลอดภัยในการรักษา</p>
          </div>
          <div className="grid gap-3 text-xs text-blue-50 sm:grid-cols-3">
            {['เชื่อมต่อข้อมูลจาก HIS', 'ติดตามผู้ป่วยตามรอบ', 'ปลอดภัยตามมาตรฐาน'].map((item) => <div key={item} className="flex items-center gap-2"><ShieldCheck size={16} className="text-cyan-300" />{item}</div>)}
          </div>
          <p className="text-[10px] text-blue-200">ระบบสำหรับสถานพยาบาล · Secure Hospital System</p>
        </div>
      </section>
      <section className="grid place-items-center px-6 py-12">
        <form onSubmit={(event) => { event.preventDefault(); sessionStorage.setItem('or-smart-auth', 'true'); navigate('/dashboard') }} className="w-full max-w-md">
          <div className="mb-8 text-center"><img src="/assets/images/logo1.png" alt="BDMS" className="mx-auto h-12 w-auto" /><h2 className="mt-6 text-2xl font-bold text-slate-800">เข้าสู่ระบบ OR SMART SSI</h2><p className="mt-2 text-sm text-slate-500">สำหรับเจ้าหน้าที่โรงพยาบาลที่ได้รับอนุญาตเท่านั้น</p></div>
          <label className="form-label">ชื่อผู้ใช้ / อีเมล<div className="relative mt-2"><UserRound className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={17} /><input className="field h-11 pl-10" placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล" defaultValue="AdminHospitalBK" /></div></label>
          <label className="form-label mt-5">รหัสผ่าน<div className="relative mt-2"><LockKeyhole className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={17} /><input type="password" className="field h-11 px-10" placeholder="กรอกรหัสผ่าน" defaultValue="password" /><Eye className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" size={17} /></div></label>
          <div className="my-5 flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-slate-500"><input type="checkbox" defaultChecked className="accent-blue-600" />จดจำการเข้าสู่ระบบ</label><button type="button" className="font-medium text-blue-600">ลืมรหัสผ่าน?</button></div>
          <button className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">เข้าสู่ระบบ</button>
          <p className="mt-8 text-center text-[10px] text-slate-400">Authorized hospital staff only<br />การเข้าใช้งานถูกบันทึกและตรวจสอบได้</p>
        </form>
      </section>
    </main>
  )
}
