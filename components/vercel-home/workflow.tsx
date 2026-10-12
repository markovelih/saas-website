'use client'
import { ArrowRight, Lock, Monitor, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Framework icons as SVG components matching Vercel's exact icons
function NextLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 180 180" fill="none">
      <mask id="mask0_408_139" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
        <circle cx="90" cy="90" r="90" fill="black" />
      </mask>
      <g mask="url(#mask0_408_139)">
        <circle cx="90" cy="90" r="87" fill="black" stroke="white" strokeWidth="6" />
        <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_408_139)" />
        <rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_408_139)" />
      </g>
      <defs>
        <linearGradient id="paint0_linear_408_139" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="paint1_linear_408_139" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function SvelteLogo() {
  return (
    <svg width="26" height="32" viewBox="0 0 26 32" fill="none">
      <path d="M24.0636 4.94916C21.4635 0.942618 16.0634 -0.461097 12.0133 1.94399L4.7631 6.34685C2.81306 7.54704 1.41303 9.44734 0.862996 11.6477C0.412986 13.4481 0.512989 15.3484 1.16299 17.0987C0.762983 17.6988 0.412975 18.3489 0.162988 19.049C-0.487024 21.1494 -0.0370192 23.4497 1.36301 25.25L1.41303 25.3001C4.01309 29.3566 9.41319 30.7104 13.4633 28.3053L20.7135 23.9024C22.6635 22.7023 24.0636 20.802 24.6136 18.5516C25.0636 16.7513 24.9636 14.851 24.3136 13.1006C24.7136 12.5006 25.0636 11.8505 25.3136 11.1504C25.9636 9.04993 25.5136 6.74959 24.1136 4.94916H24.0636ZM13.0133 26.0002L9.31323 28.2505C6.91318 29.6507 3.86312 28.9006 2.36309 26.5503C1.56307 25.35 1.36306 23.8498 1.76308 22.4996C1.81307 22.2496 1.91308 21.9996 2.01308 21.7495L2.2131 21.3495L2.6131 21.5995C3.51312 22.1496 4.4632 22.5996 5.46322 22.8997L5.76322 22.9497L5.71322 23.2497C5.61321 23.7998 5.76322 24.3999 6.11323 24.8499C6.61324 25.5 7.46326 25.75 8.21327 25.4999L8.31327 25.4499L15.5635 21.0471C16.0135 20.7971 16.3635 20.347 16.4635 19.847C16.5635 19.2969 16.4135 18.7469 16.0635 18.3468C15.5634 17.6967 14.7134 17.4467 13.9634 17.6968L13.8634 17.7468L10.7133 19.6971C10.2133 19.9472 9.66331 20.0972 9.11329 20.1972C7.0132 20.2472 5.06316 19.0471 4.16315 17.1467C3.66313 16.0966 3.56313 14.8964 3.91314 13.7963C4.26314 12.6961 5.01316 11.7459 6.01318 11.1458L13.2634 6.74296C13.7634 6.49291 14.3134 6.34289 14.8634 6.24287C16.9635 6.19286 18.9135 7.39304 19.8136 9.29349C20.3136 10.3436 20.4136 11.5438 20.0636 12.644C20.0136 12.894 19.9136 13.144 19.8136 13.394L19.6136 13.7941L19.2135 13.5441C18.3135 12.994 17.3635 12.5439 16.3635 12.2439L16.0635 12.1939L16.1135 11.8938C16.2135 11.3438 16.0635 10.7437 15.7135 10.2936C15.2134 9.64353 14.3634 9.39349 13.6134 9.64354L13.5134 9.69355L6.2631 14.1464C5.8131 14.3964 5.46309 14.8465 5.36309 15.3466C5.26309 15.8967 5.41309 16.4467 5.76309 16.8468C6.26311 17.4969 7.11312 17.7469 7.86314 17.4968L7.96314 17.4468L11.1132 15.4465C11.6132 15.1965 12.1632 15.0464 12.7133 14.9464C14.8133 14.8964 16.7634 16.0965 17.6634 17.997C18.1634 19.0471 18.2634 20.2472 17.9134 21.3473C17.5634 22.4475 16.8134 23.3977 15.8134 23.9978L8.56323 28.4006L13.0133 26.0002Z" fill="#FF3E00" />
    </svg>
  )
}

function ReactLogo() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
      <ellipse cx="16" cy="14" rx="2.5" ry="2.5" fill="#61DAFB" />
      <ellipse cx="16" cy="14" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" />
      <ellipse cx="16" cy="14" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(60 16 14)" />
      <ellipse cx="16" cy="14" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1" fill="none" transform="rotate(120 16 14)" />
    </svg>
  )
}

function NuxtLogo() {
  return (
    <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
      <path d="M17.728 21H29.0453C29.3841 21 29.7168 20.9121 30.0091 20.7453C30.3015 20.5786 30.5427 20.339 30.7089 20.0516C30.8752 19.7641 30.9606 19.439 30.9565 19.1096C30.9525 18.7801 30.8592 18.4571 30.6859 18.1736L23.0293 5.62227C22.8632 5.33503 22.6221 5.09561 22.3299 4.92897C22.0377 4.76234 21.7051 4.67452 21.3666 4.67452C21.028 4.67452 20.6954 4.76234 20.4033 4.92897C20.1111 5.09561 19.87 5.33503 19.7038 5.62227L17.728 9.02459L13.8363 2.4254C13.6698 2.13838 13.4285 1.89922 13.1362 1.73281C12.844 1.56641 12.5115 1.47876 12.173 1.47876C11.8346 1.47876 11.502 1.56641 11.2098 1.73281C10.9175 1.89922 10.6763 2.13838 10.5097 2.4254L0.270235 18.1736C0.0969025 18.4571 0.00363016 18.7801 -0.000425987 19.1096C-0.00448213 19.439 0.0809019 19.7641 0.247134 20.0516C0.413367 20.339 0.654615 20.5786 0.94695 20.7453C1.23929 20.9121 1.57199 21 1.9108 21H9.66987C12.6229 21 14.7981 19.7117 16.2726 17.2136L19.8019 11.2769L21.3657 8.46865L26.7046 17.456H19.8019L17.728 21ZM9.5319 17.4528L4.21917 17.4511L12.1771 4.92459L16.0538 11.2769L13.5178 15.5697C12.5762 17.0965 11.4615 17.4528 9.5319 17.4528Z" fill="#00DC82" />
    </svg>
  )
}

function AstroLogo() {
  return (
    <svg width="26" height="32" viewBox="0 0 26 32" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M18.901 23.5616C17.8358 24.6908 15.7377 25.3341 13.3372 25.3341C10.2704 25.3341 7.7066 24.2341 7.22446 22.7656C7.0778 23.3639 7.0096 24.0096 7.0096 24.6952C7.0096 24.6952 7.37347 28.0629 10.2555 29.3689C10.2555 28.3356 11.0877 27.4975 12.1135 27.4975C14.2067 27.4975 14.2034 29.498 14.2008 31.1246C14.2007 31.1754 14.2006 31.2257 14.2006 31.2754C14.2006 34.0893 15.859 36.5014 18.2962 37.556C17.5739 36.4801 17.2183 35.1808 17.2183 33.7723C17.2183 31.1421 18.6744 29.8686 20.4132 28.3684C21.5174 27.4151 22.7251 26.3728 23.6619 24.8588C24.8271 22.9722 25.3333 20.7446 25.3333 18.3333L25.0256 18.4856C23.1513 19.4227 21.7629 21.1595 21.3037 23.2338C20.6687 22.8119 20.1973 22.1813 19.9744 21.4442C19.7516 20.7072 19.7927 19.9123 20.0902 19.2025C18.7134 19.9481 17.643 21.1746 17.0923 22.6591C16.8174 23.3829 16.2974 23.8616 15.686 23.9591L15.686 23.9591C15.4102 24.0031 15.125 23.9561 14.8843 23.8269C14.6437 23.6978 14.4628 23.4947 14.3725 23.2512C14.1048 22.5294 14.0413 21.7454 14.1893 20.9894C14.3372 20.2334 14.6906 19.5346 15.2089 18.9726C13.6236 19.5298 12.2919 20.6395 11.4571 22.0977C10.6223 23.5558 10.3391 25.2661 10.6594 26.9134C8.15054 25.7649 6.40002 23.246 6.40002 20.3333C6.40002 19.6217 6.49922 18.9327 6.68548 18.2797C5.15055 20.2272 4.26669 22.7211 4.26669 25.4167C4.26669 30.7655 8.31964 35.1439 13.5163 35.6224L13.2 34.3333C12.5635 34.3333 11.953 34.0804 11.5029 33.6303C11.0529 33.1802 10.8 32.5697 10.8 31.9333C10.8 31.2969 11.0529 30.6864 11.5029 30.2363C11.953 29.7863 12.5635 29.5333 13.2 29.5333C13.8365 29.5333 14.447 29.7863 14.8971 30.2363C15.3472 30.6864 15.6 31.2969 15.6 31.9333L15.6 31.9333C15.6 32.5697 15.3472 33.1802 14.8971 33.6303C14.447 34.0804 13.8365 34.3333 13.2 34.3333L13.5163 35.6224C15.2092 35.4668 16.7777 34.7318 17.9575 33.5461C19.1373 32.3604 19.8547 30.7998 19.9859 29.1402C20.2634 29.0519 20.5332 28.9413 20.7925 28.8094C19.7963 30.5115 18.1156 31.7356 16.17 32.2227L16.1766 32.2661C16.9174 32.1176 17.6246 31.8303 18.2602 31.4193C18.8958 31.0084 19.4479 30.4817 19.8862 29.8674C20.3245 29.2531 20.6405 28.563 20.8173 27.8332C20.9942 27.1034 21.0285 26.3476 20.9185 25.6053C20.3168 25.0665 19.6242 24.3033 18.901 23.5616Z" fill="white" />
      <path d="M0.666687 23.4167C1.54174 21.3106 3.21174 18.6656 5.78508 15.8089C7.61814 13.7719 10.2148 11.3333 13.4181 8.91497C13.3581 9.38164 13.3334 9.7583 13.3334 10.0433C13.3334 11.1733 13.5251 12.2316 13.8834 13.2149L13.8851 13.2199C10.1634 15.9699 7.27008 18.7483 5.36341 21.3133C4.45008 22.5416 3.74008 23.7233 3.22341 24.8433C2.73222 25.9054 2.40174 26.8939 2.22841 27.8016L2.22674 27.8099L2.22508 27.8183C2.15508 28.1749 2.10341 28.5166 2.06841 28.8433C1.65674 28.0616 1.24508 27.0333 1.02841 25.7633C0.829354 24.5683 0.666687 23.4166 0.666687 23.4166V23.4167Z" fill="white" />
      <path d="M13.3334 10.0433C13.3334 9.7583 13.3581 9.38164 13.4181 8.91497C13.5115 8.21164 13.6664 7.28997 13.9248 6.18497C14.2164 4.91664 14.5481 3.77164 14.9131 2.7683C15.2731 1.77997 15.6498 0.96497 16.0381 0.333303C16.4714 2.14664 17.0098 3.67164 17.6064 4.9133C18.1481 6.03997 18.7514 6.96164 19.3648 7.69164C19.9681 8.40997 20.5781 8.9383 21.1431 9.2983C21.6998 9.65164 22.2014 9.8333 22.6014 9.8733C22.3831 10.1183 22.1098 10.4166 21.7914 10.7666C21.2714 11.3399 20.6631 12.0433 20.0181 12.8599C19.3831 13.6666 18.7148 14.5816 18.0698 15.5799C17.4198 16.5899 16.8148 17.6699 16.3064 18.7933C15.3914 16.2649 14.9914 14.3066 14.9431 12.7733C14.8914 11.1316 15.2048 9.95664 15.6314 9.0583C15.1098 9.43164 14.4681 9.84997 13.8851 10.2916C13.6831 10.2083 13.4998 10.1233 13.3334 10.0433Z" fill="white" />
    </svg>
  )
}

function PythonLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M13.8995 0C6.81049 0 7.26628 2.95 7.26628 2.95L7.27379 5.99686H14.0246V6.91837H4.6088C4.6088 6.91837 0 6.38549 0 13.5262C0 20.6668 4.01524 20.4275 4.01524 20.4275H6.40336V17.2586C6.40336 17.2586 6.28056 13.2433 10.3708 13.2433H17.0595C17.0595 13.2433 20.8971 13.3036 20.8971 9.52892V3.50758C20.8971 3.50758 21.4538 0 13.8995 0ZM10.2834 2.02785C10.9626 2.02785 11.5117 2.57699 11.5117 3.2562C11.5117 3.93541 10.9626 4.48455 10.2834 4.48455C9.60415 4.48455 9.05501 3.93541 9.05501 3.2562C9.05501 2.57699 9.60415 2.02785 10.2834 2.02785Z" fill="url(#paint0_linear_python)" />
      <path d="M14.1005 28C21.1895 28 20.7337 25.05 20.7337 25.05L20.7262 22.0031H13.9754V21.0816H23.3912C23.3912 21.0816 28 21.6145 28 14.4738C28 7.33324 23.9848 7.5725 23.9848 7.5725H21.5966V10.7414C21.5966 10.7414 21.7194 14.7567 17.6292 14.7567H10.9405C10.9405 14.7567 7.10285 14.6964 7.10285 18.4711V24.4924C7.10285 24.4924 6.54618 28 14.1005 28ZM17.7166 25.9721C17.0374 25.9721 16.4883 25.423 16.4883 24.7438C16.4883 24.0646 17.0374 23.5154 17.7166 23.5154C18.3958 23.5154 18.945 24.0646 18.945 24.7438C18.945 25.423 18.3958 25.9721 17.7166 25.9721Z" fill="url(#paint1_linear_python)" />
      <defs>
        <linearGradient id="paint0_linear_python" x1="2.24" y1="1.77" x2="17.75" y2="14.89" gradientUnits="userSpaceOnUse">
          <stop stopColor="#387EB8" />
          <stop offset="1" stopColor="#366994" />
        </linearGradient>
        <linearGradient id="paint1_linear_python" x1="10.2" y1="13.15" x2="25.9" y2="26.31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE052" />
          <stop offset="1" stopColor="#FFC331" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function BitbucketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M0.5 1.5C0.5 1.22386 0.723858 1 1 1H15C15.2761 1 15.5 1.22386 15.5 1.5C15.5 1.59723 15.4752 1.68946 15.4308 1.77L13.0769 6.77C13.0288 6.86629 12.9319 6.93 12.824 6.93H3.176C3.0681 6.93 2.97124 6.86629 2.92308 6.77L0.569231 1.77C0.524752 1.68946 0.5 1.59723 0.5 1.5Z" fill="#2684FF" />
      <path d="M2.5 7.5H13.5L10.5 15H5.5L2.5 7.5Z" fill="#2684FF" />
    </svg>
  )
}

function GitLabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 15.5L10.5 8H5.5L8 15.5Z" fill="#E24329" />
      <path d="M8 15.5L5.5 8H1L8 15.5Z" fill="#FC6D26" />
      <path d="M1 8L0 11L8 15.5L1 8Z" fill="#FCA326" />
      <path d="M1 8H5.5L3.5 1.5L1 8Z" fill="#E24329" />
      <path d="M8 15.5L10.5 8H15L8 15.5Z" fill="#FC6D26" />
      <path d="M15 8L16 11L8 15.5L15 8Z" fill="#FCA326" />
      <path d="M15 8H10.5L12.5 1.5L15 8Z" fill="#E24329" />
    </svg>
  )
}

const cards = [
  { title: 'Business Websites', Logo: NextLogo, color: 'rgba(255,255,255,0.1)', lineColor: 'rgba(255,255,255,0.15)' },
  { title: 'Booking Systems', Logo: SvelteLogo, color: 'rgba(255,62,0,0.15)', lineColor: 'rgba(255,62,0,0.2)' },
  { title: 'Client Dashboards', Logo: ReactLogo, color: 'rgba(97,218,251,0.12)', lineColor: 'rgba(97,218,251,0.18)' },
  { title: 'SaaS Applications', Logo: NuxtLogo, color: 'rgba(0,220,130,0.12)', lineColor: 'rgba(0,220,130,0.18)' },
  { title: 'Landing Pages', Logo: AstroLogo, color: 'rgba(255,255,255,0.1)', lineColor: 'rgba(255,255,255,0.15)' },
  { title: 'Custom Software', Logo: PythonLogo, color: 'rgba(255,224,82,0.12)', lineColor: 'rgba(255,224,82,0.18)' },
]

function DashedGridCard({ card, index }: { card: typeof cards[0]; index: number }) {
  const { title, Logo, color, lineColor } = card

  return (
    <motion.a
      href="/register"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative block"
    >
      {/* Top section with grid */}
      <div
        className="relative h-[120px] overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${color} 0%, transparent 100%)`,
        }}
      >
        {/* Dashed grid lines */}
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {/* Horizontal lines */}
          <line x1="0" y1="40" x2="100%" y2="40" stroke={lineColor} strokeWidth="1" strokeDasharray="4 6" />
          <line x1="0" y1="80" x2="100%" y2="80" stroke={lineColor} strokeWidth="1" strokeDasharray="4 6" />
          {/* Vertical lines */}
          <line x1="20%" y1="0" x2="20%" y2="100%" stroke={lineColor} strokeWidth="1" strokeDasharray="4 6" />
          <line x1="40%" y1="0" x2="40%" y2="100%" stroke={lineColor} strokeWidth="1" strokeDasharray="4 6" />
          <line x1="60%" y1="0" x2="60%" y2="100%" stroke={lineColor} strokeWidth="1" strokeDasharray="4 6" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke={lineColor} strokeWidth="1" strokeDasharray="4 6" />
        </svg>

        {/* Outer dashed border */}
        <div
          className="absolute inset-0 border border-dashed"
          style={{ borderColor: lineColor }}
        />

        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-dashed transition-transform duration-300 group-hover:scale-105"
            style={{
              borderColor: lineColor,
              background: 'rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/10 bg-black">
              <Logo />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with title */}
      <div className="border-x border-b border-dashed px-5 py-4" style={{ borderColor: lineColor }}>
        <h3 className="text-[16px] font-semibold tracking-tight text-white">{title}</h3>
      </div>
    </motion.a>
  )
}

export function Workflow() {
  const [flipped, setFlipped] = useState(false)
const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

const text = 'Start Your Project'

const flipText = () => {
  setDirection((prev) => (prev === 'forward' ? 'backward' : 'forward'))
  setFlipped((prev) => !prev)
}

useEffect(() => {
  const interval = setInterval(() => {
    setDirection((prev) => (prev === 'forward' ? 'backward' : 'forward'))
    setFlipped((prev) => !prev)
  }, 15000)

  return () => clearInterval(interval)
}, [])

  return (
    <section id="workflow" className="relative overflow-hidden bg-black py-20 text-white md:py-28">
            <div className="relative z-10 mx-auto max-w-[1200px] border border-white/[0.12] px-6 py-8 md:px-8 md:py-10">
              <svg
  className="pointer-events-none absolute -left-[8px] -top-[8px] z-[999] hidden h-4 w-4 text-white/75 md:block"
  viewBox="0 0 16 16"
  fill="none"
  aria-hidden="true"
>
  <path d="M8 0V16" stroke="currentColor" strokeWidth="1" />
  <path d="M0 8H16" stroke="currentColor" strokeWidth="1" />
</svg>

<svg
  className="pointer-events-none absolute -bottom-[8px] -right-[8px] z-[999] hidden h-4 w-4 text-white/75 md:block"
  viewBox="0 0 16 16"
  fill="none"
  aria-hidden="true"
>
  <path d="M8 0V16" stroke="currentColor" strokeWidth="1" />
  <path d="M0 8H16" stroke="currentColor" strokeWidth="1" />
</svg>
        <div className="relative grid gap-16 md:grid-cols-[340px_1fr] md:gap-8">
  
  {/* Perfect vertical line */}
  <div className="absolute -top-10 -bottom-10 left-[340px] hidden w-px bg-white/[0.12] md:block" />
          {/* Left column - Title and features */}
          <div className="md:pr-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-[38px] font-bold leading-[1.1] tracking-[-0.04em] text-white md:text-[44px]"
            >
              Bring your
              <br />
              business idea
              <br />
              to life.
            </motion.h2>

            <div className="mt-10 space-y-6">
              {/* Git icons row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="flex items-center gap-1 pt-0.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                    <GitHubIcon />
                  </div>
                  <div className="-ml-1 flex h-5 w-5 items-center justify-center rounded bg-[#2684FF]">
                    <BitbucketIcon />
                  </div>
                  <div className="-ml-1 flex h-5 w-5 items-center justify-center rounded bg-[#E24329]">
                    <GitLabIcon />
                  </div>
                </div>
                <p className="text-[15px] leading-relaxed text-white/60">
                  We handle design, development, and{' '}
                  <span className="text-white">your launch</span>
                </p>
              </motion.div>

              {/* Features */}
              {[
                { Icon: Monitor, highlight: 'Custom builds', text: ' for websites, SaaS, and business software' },
                { Icon: Eye, highlight: 'Working previews', text: ' to review progress and give feedback' },
                { Icon: Lock, highlight: 'Automatic HTTPS', text: ' for all your domains' },
              ].map((item, i) => (
                <motion.div
                  key={item.highlight}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <item.Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/60" strokeWidth={1.5} />
                  <p className="text-[15px] leading-relaxed text-white/60">
                    <span className="text-white">{item.highlight}</span>
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right column - Template cards */}
          <div className="md:pl-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {cards.map((card, index) => (
                <DashedGridCard key={card.title} card={card} index={index} />
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-20 grid gap-5 md:grid-cols-[1fr_280px]">
              <motion.a
  href="/register"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4, delay: 0.3 }}
  onMouseEnter={flipText}
  className="group relative flex h-[88px] items-center justify-between overflow-hidden rounded-full border border-white/10 bg-black px-8 transition-colors hover:border-white/20"
>
  <span className="relative flex text-[36px] font-bold tracking-[-0.04em] text-white md:text-[40px]">
  {text.split('').map((char, i) => {
    const delay =
      direction === 'forward'
        ? i * 0.035
        : (text.length - i) * 0.035

    return (
      <motion.span
        key={`${char}-${i}`}
        animate={{ rotateX: flipped ? 180 : 0 }}
        transition={{
          duration: 0.55,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative inline-block [transform-style:preserve-3d]"
      >
        <span className="block [backface-visibility:hidden]">
          {char === ' ' ? '\u00A0' : char}
        </span>
        <span className="absolute inset-0 block [transform:rotateX(180deg)] [backface-visibility:hidden]">
          {char === ' ' ? '\u00A0' : char}
        </span>
      </motion.span>
    )
  })}
</span>

  <motion.span
    animate={{ rotate: flipped ? 180 : 0 }}
    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-transform duration-200 group-hover:scale-105"
  >
    <ArrowRight className="h-6 w-6" />
  </motion.span>
</motion.a>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="flex flex-col justify-center gap-3"
              >
                <a
                  href="/register"
                  className="flex h-11 items-center justify-center rounded-full border border-white/20 bg-white text-[14px] font-medium text-black transition-opacity hover:opacity-90"
                >
                  Talk to an Expert
                </a>
                                <a
                  href="/register"
                  className="flex h-11 items-center justify-center rounded-full border border-white/10 text-[14px] font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
                >
                  Discuss Your Project
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
