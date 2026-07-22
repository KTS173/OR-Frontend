import { Building2, Eye, LogIn, ShieldCheck, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="login-shell min-h-screen bg-white">

      {/* ── Left Hero ── */}
      <section className="login-hero relative hidden overflow-hidden text-white lg:flex lg:flex-col">
        <img src="/assets/images/login.png" alt="โรงพยาบาลกรุงเทพ" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#002b63]/88" />

        <div className="relative flex h-full flex-col px-[7%] pt-[4.5%] pb-[3%]">
          <img src="/assets/images/logo1.png" alt="BDMS" className="h-auto w-[168px]" />

          <div className="mt-[5.2vh]">
            <h1 className="login-hero-title">OR SMART <span className="login-hero-accent">SSI</span></h1>
            <p className="login-hero-subtitle mt-5">ระบบติดตามภาวะแผลติดเชื้อหลังผ่าตัด</p>
            <p className="login-hero-body mt-[9vh]">
              ระบบติดตามภาวะแผลติดเชื้อหลังผ่าตัด ช่วยเฝ้าระวังและติดตามผู้ป่วย<br />
              หลังการผ่าตัด อย่างเป็นระบบและมีประสิทธิภาพ
            </p>
          </div>

          <div className="mt-auto space-y-6 pb-[9vh]">
            <Feature icon={Building2} title="เชื่อมต่อข้อมูลจาก HIS / TrackCare" detail="แบบอัตโนมัติ ลดการบันทึกข้อมูลซ้ำซ้อน" />
            <Feature icon={UsersRound} title="ติดตามผู้ป่วยหลังผ่าตัดตามรอบ" detail="30 / 60 / 90 วัน" />
            <Feature icon={ShieldCheck} title="ปลอดภัย มั่นใจในการรักษาข้อมูล" detail="ตามมาตรฐานโรงพยาบาล" />
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 pt-7 text-[13px]">
            <ShieldCheck size={19} />
            <div>
              <p className="font-semibold">ระบบสำหรับสถานพยาบาล</p>
              <p className="text-[#a8c0e2]">Secure Hospital System</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Card ── */}
      <section className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <form
          onSubmit={(e) => { e.preventDefault(); sessionStorage.setItem('or-smart-auth', 'true'); navigate('/dashboard') }}
          className="login-card w-full max-w-[630px]"
        >
          {/* Logo + heading */}
          <div className="text-center">
            <img src="/assets/images/logo1.png" alt="BDMS" className="mx-auto h-auto w-[154px]" />
            <h2 className="login-heading mt-12">เข้าสู่ระบบ OR SMART SSI</h2>
            <p className="login-tagline mt-3">สำหรับเจ้าหน้าที่โรงพยาบาลที่ได้รับอนุญาตเท่านั้น</p>
          </div>

          {/* Username */}
          <label className="login-label mt-12">
            ชื่อผู้ใช้ / อีเมล
            <input className="login-input mt-3" placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล" />
          </label>

          {/* Password */}
          <label className="login-label mt-7">
            รหัสผ่าน
            <span className="relative mt-3 block">
              <input type="password" className="login-input login-input-password" placeholder="กรอกรหัสผ่าน" />
              <Eye className="absolute top-1/2 right-4 -translate-y-1/2 text-[#9aa3af]" size={19} />
            </span>
          </label>

          {/* Remember / Forgot */}
          <div className="my-8 flex items-center justify-between">
            <label className="flex items-center gap-3 text-[13px] text-[#353a41]">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
              จดจำการเข้าสู่ระบบ
            </label>
            <button type="button" className="login-link">ลืมรหัสผ่าน?</button>
          </div>

          {/* Submit */}
          <button className="login-btn"><LogIn size={21} />เข้าสู่ระบบ</button>

          {/* Authorized strip */}
          <div className="mt-11 border-t border-[#e5e7eb] pt-10">
            <p className="login-secure-title"><ShieldCheck size={18} />Authorized hospital staff only</p>
            <p className="login-secure-note">ทุกการเข้าใช้งานถูกบันทึกและตรวจสอบได้</p>
          </div>
        </form>

        <footer className="login-footer"><span>Version 1.0</span><span>© Bangkok Hospital</span></footer>
      </section>

    </main>
  )
}

function Feature({ icon: Icon, title, detail }) {
  return (
    <div className="login-feature">
      <span className="login-feature-icon"><Icon size={23} /></span>
      <div>
        <p className="login-feature-name">{title}</p>
        <p className="login-feature-detail">{detail}</p>
      </div>
    </div>
  )
}
