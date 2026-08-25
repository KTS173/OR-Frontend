import { LogIn, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../services/api.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const handleSubmit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError('')
    const form = new FormData(event.currentTarget)
    try { const user = await api.login(form.get('username'), form.get('password')); sessionStorage.setItem('or-smart-auth', 'true'); sessionStorage.setItem('or-smart-user', JSON.stringify(user)); navigate('/dashboard') }
    catch (reason) { setError(reason.message) }
    finally { setSubmitting(false) }
  }

  return (
    <main className="login-shell min-h-screen bg-white">

      {/* ── Left Hero ── */}
      <section className="login-hero relative overflow-hidden text-white">
        <img src="/assets/images/login.png" alt="โรงพยาบาลกรุงเทพ" className="absolute inset-0 h-full w-full object-cover" />
        <div className="login-hero-overlay absolute inset-0" />

        <div className="login-hero-content relative flex h-full flex-col">
          <img src="/assets/images/logo1.png" alt="BDMS" className="h-auto w-[122px]" />

          <div className="login-hero-intro">
            <h1 className="login-hero-title">OR SMART <span className="login-hero-accent">SSI</span></h1>
            <p className="login-hero-subtitle">ระบบติดตามภาวะแผลติดเชื้อหลังผ่าตัด</p>
            <p className="login-hero-body">
              ระบบติดตามภาวะแผลติดเชื้อหลังผ่าตัด ช่วยเฝ้าระวังและติดตามผู้ป่วย
              หลังการผ่าตัด อย่างเป็นระบบและมีประสิทธิภาพ
            </p>
          </div>

          <div className="login-features mt-auto">
            <Feature icon="/assets/icon/1.png" title="เชื่อมต่อข้อมูลจาก HIS / TrackCare" detail="แบบอัตโนมัติ ลดการบันทึกข้อมูลซ้ำซ้อน" />
            <Feature icon="/assets/icon/Icon2.png" title="ติดตามผู้ป่วยหลังผ่าตัดตามรอบ" detail="30 / 60 / 90 วัน" />
            <Feature icon="/assets/icon/Icon.png" title="ปลอดภัย มั่นใจในการรักษาข้อมูล" detail="ตามมาตรฐานโรงพยาบาล" />
          </div>

          <div className="login-hero-footer">
            <img className="login-footer-icon" src="/assets/icon/Icon3.png" alt="" />
            <div>
              <p className="font-semibold">ระบบสำหรับสถานพยาบาล</p>
              <p className="text-[#a8c0e2]">Secure Hospital System</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Card ── */}
      <section className="login-panel relative flex min-h-screen items-center justify-center px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="login-card"
        >
          {/* Logo + heading */}
          <div className="text-center">
            <img src="/assets/images/logo1.png" alt="BDMS" className="mx-auto h-auto w-[122px]" />
            <h2 className="login-heading">เข้าสู่ระบบ OR SMART SSI</h2>
            <p className="login-tagline">สำหรับเจ้าหน้าที่โรงพยาบาลที่ได้รับอนุญาตเท่านั้น</p>
          </div>

          {/* Username */}
          <label className="login-label login-first-field">
            ชื่อผู้ใช้ / อีเมล
            <input
              className="login-input"
              name="username"
              autoComplete="username"
              inputMode="email"
              placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล"
              required
            />
          </label>

          {/* Password */}
          <label className="login-label login-password-field">
            รหัสผ่าน
            <input
              type="password"
              className="login-input"
              name="password"
              autoComplete="current-password"
              placeholder="กรอกรหัสผ่าน"
              required
            />
          </label>

          {/* Remember / Forgot */}
          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" />
              จดจำการเข้าสู่ระบบ
            </label>
            <button type="button" className="login-link">ลืมรหัสผ่าน?</button>
          </div>

          {/* Submit */}
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button disabled={submitting} className="login-btn"><LogIn size={21} />{submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>

          {/* Authorized strip */}
          <div className="login-secure">
            <p className="login-secure-title"><ShieldCheck size={18} />Authorized hospital staff only</p>
            <p className="login-secure-note">ทุกการเข้าใช้งานถูกบันทึกและตรวจสอบได้</p>
          </div>
        </form>

        <footer className="login-footer"><span>Version 1.0</span><span>© Bangkok Hospital</span></footer>
      </section>

    </main>
  )
}

function Feature({ icon, title, detail }) {
  return (
    <div className="login-feature">
      <span className="login-feature-icon">
        <img src={icon} alt="" />
      </span>
      <div>
        <p className="login-feature-name">{title}</p>
        <p className="login-feature-detail">{detail}</p>
      </div>
    </div>
  )
}
