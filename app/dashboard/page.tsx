import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Code2,
  FileText,
  FolderOpen,
  Globe,
  Layers3,
  LockKeyhole,
  MessageSquare,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  BarChart3,
  BellRing,
  LifeBuoy,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/dashboard/status-badge'

type ProjectStep = {
  label: string
  description: string
  done: boolean
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', user.email ?? '')
    .maybeSingle()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .or(`user_id.eq.${user.id},contact_email.eq.${user.email}`)
    .order('created_at', { ascending: false })
    .limit(6)

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${user.id},contact_email.eq.${user.email}`)

  const { count: activeOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${user.id},contact_email.eq.${user.email}`)
    .in('status', ['pending', 'in_review', 'invoice_sent', 'paid', 'in_progress'])

  const { count: completedOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${user.id},contact_email.eq.${user.email}`)
    .eq('status', 'completed')

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user.user_metadata?.full_name?.split(' ')[0] ||
    'Client'

  const currentOrder = orders?.[0] || null

  const steps: ProjectStep[] = [
    {
      label: 'Intake',
      description: 'Project scope, goals, and requirements are captured.',
      done: !!currentOrder,
    },
    {
      label: 'Design',
      description: 'Layout direction, visual hierarchy, and interface language.',
      done: !!currentOrder && (activeOrders || 0) > 0,
    },
    {
      label: 'Development',
      description: 'Implementation, responsiveness, and system structure.',
      done: false,
    },
    {
      label: 'Launch',
      description: 'Review, polish, final delivery, and deployment.',
      done: false,
    },
  ]

  const stats = [
    {
      label: 'Total orders',
      value: totalOrders || 0,
      icon: FolderOpen,
      description: 'All submitted website requests',
    },
    {
      label: 'Active projects',
      value: activeOrders || 0,
      icon: Clock3,
      description: 'Projects currently moving through delivery',
    },
    {
      label: 'Completed',
      value: completedOrders || 0,
      icon: CheckCircle2,
      description: 'Finished and delivered projects',
    },
  ]

  const quickActions = [
    {
      href: '/dashboard/new-order',
      icon: Plus,
      title: 'New order',
      text: 'Create a new project request and define scope clearly.',
    },
    {
      href: '/dashboard/files',
      icon: UploadCloud,
      title: 'Upload assets',
      text: 'Send logos, content, references, and visual materials.',
    },
    {
      href: '/dashboard/messages',
      icon: MessageSquare,
      title: 'Messages',
      text: 'Keep communication and revision flow in one place.',
    },
    {
      href: '/dashboard/support',
      icon: LifeBuoy,
      title: 'Support',
      text: 'Get help with files, project process, or next steps.',
    },
  ]

  const principles = [
    {
      icon: Rocket,
      title: 'Fast execution',
      text: 'Clean structure, controlled workflow, and serious delivery speed.',
    },
    {
      icon: ShieldCheck,
      title: 'Trust-focused',
      text: 'A client workspace that feels stable, premium, and professional.',
    },
    {
      icon: Layers3,
      title: 'System design',
      text: 'Sections are organized like a product, not a random admin panel.',
    },
    {
      icon: LockKeyhole,
      title: 'Built to scale',
      text: 'A stronger base for future updates, growth, and expansion.',
    },
  ]

  return (
    <div className="space-y-4 pb-2">
      <style>{`
        @keyframes dashPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        @keyframes dashGlow {
          0%, 100% { opacity: 0.24; }
          50% { opacity: 0.75; }
        }

        @keyframes dashFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes dashSlide {
          0% { transform: translateX(-6px); opacity: 0.15; }
          50% { transform: translateX(0px); opacity: 1; }
          100% { transform: translateX(6px); opacity: 0.15; }
        }
      `}</style>

      <section className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-black">
        <div className="grid xl:grid-cols-[1.12fr_0.88fr]">
          <div className="relative border-b border-white/[0.07] xl:border-b-0 xl:border-r">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:88px_88px]" />
            <div className="absolute left-[18%] top-[22%] h-28 w-28 rounded-full bg-white/[0.03] blur-3xl" />
            <div className="absolute right-[10%] top-[10%] h-36 w-36 rounded-full bg-blue-500/[0.07] blur-3xl" />
            <div className="absolute bottom-[14%] left-[34%] h-44 w-44 rounded-full bg-indigo-500/[0.05] blur-3xl" />

            <div className="relative px-6 py-8 md:px-8 md:py-10 xl:px-10 xl:py-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/52">
                <span
                  className="h-2 w-2 rounded-full bg-white"
                  style={{ animation: 'dashPulse 2.2s ease-in-out infinite' }}
                />
                Client workspace
              </div>

              <div className="mt-8 max-w-3xl">
                <h1 className="max-w-4xl text-[38px] font-semibold leading-[0.96] tracking-[-0.06em] text-white md:text-[58px]">
                  Premium project control,
                  <span className="block text-white/78">
                    built to feel serious from the first second.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/44 md:text-[15px]">
                  Welcome back, {firstName}. This dashboard is designed as a refined client control
                  center — not just to show status, but to create trust, clarity, and a stronger
                  project experience from intake to launch.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-11 rounded-full bg-white px-5 text-sm font-medium text-black hover:bg-white/90"
                >
                  <Link href="/dashboard/new-order">
                    Start new project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-full border-white/[0.1] bg-white/[0.02] px-5 text-sm text-white hover:bg-white/[0.05]"
                >
                  <Link href="/dashboard/orders">View all projects</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 md:grid-cols-3">
                {[
                  { value: '01', title: 'Structured delivery' },
                  { value: '02', title: 'Client-grade clarity' },
                  { value: '03', title: 'Controlled execution' },
                ].map((item) => (
                  <div
                    key={item.value}
                    className="rounded-[22px] border border-white/[0.07] bg-white/[0.02] px-4 py-4 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.035]"
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/28">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white/84">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:88px_88px]" />
            <div className="relative h-full min-h-[420px] px-6 py-8 md:px-8 md:py-10 xl:px-10 xl:py-12">
              <div className="grid h-full gap-4 md:grid-cols-2 md:grid-rows-[auto_1fr_auto]">
                <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.02] p-5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">
                        Workspace signal
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">System ready for delivery</p>
                    </div>
                    <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-white/60">
                      Live
                    </div>
                  </div>
                </div>

                <div
                  className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-black p-5"
                  style={{ animation: 'dashFloat 5.5s ease-in-out infinite' }}
                >
                  <div className="absolute left-6 top-10 h-px w-24 bg-white/[0.12]" />
                  <div className="absolute left-[120px] top-10 h-px w-16 bg-blue-500/60" />
                  <div className="absolute left-[180px] top-[39px] h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.9)]" />
                  <div className="absolute left-[182px] top-[39px] h-24 w-px bg-gradient-to-b from-blue-500/80 to-transparent" />
                  <div className="absolute left-[182px] top-[136px] h-2 w-2 rounded-full bg-white/80" />
                  <div className="absolute left-[184px] top-[138px] h-px w-24 bg-gradient-to-r from-white/70 to-transparent" />

                  <div className="relative">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">
                      Delivery graph
                    </p>
                    <h3 className="mt-3 text-lg font-medium tracking-[-0.03em] text-white">
                      A cleaner client-facing system layer.
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/42">
                      Thin lines, strict borders, and restrained signals give the interface a more
                      professional SaaS feel.
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/[0.07] bg-black p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">
                    Activity state
                  </p>

                  <div className="mt-5 space-y-4">
                    {[
                      { label: 'Scope intake', value: 'stable', glow: 'bg-white/90' },
                      { label: 'Design direction', value: 'active', glow: 'bg-blue-400' },
                      { label: 'Launch path', value: 'ready', glow: 'bg-white/65' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-white/42">{row.label}</span>
                          <span className="uppercase tracking-[0.18em] text-white/62">
                            {row.value}
                          </span>
                        </div>
                        <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={`h-[3px] w-[72%] ${row.glow}`}
                            style={{ animation: 'dashSlide 3.6s ease-in-out infinite' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.02] p-5 md:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">
                    Design direction
                  </p>
                  <p className="mt-3 text-base font-medium tracking-[-0.03em] text-white">
                    Controlled dark interface with high-trust spacing, modular borders, and subtle
                    blue infrastructure signals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[26px] border border-white/[0.07] bg-black p-5 transition-all duration-500 hover:border-white/[0.12]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]">
                <stat.icon className="h-4.5 w-4.5 text-white/76" />
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/28">Metric</div>
            </div>

            <div className="mt-8">
              <p className="text-[42px] font-semibold leading-none tracking-[-0.06em] text-white">
                {stat.value}
              </p>
              <p className="mt-3 text-sm font-medium text-white/82">{stat.label}</p>
              <p className="mt-1 text-sm leading-6 text-white/40">{stat.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-black">
          <div className="grid border-b border-white/[0.07] md:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-white/[0.07] p-6 md:border-b-0 md:border-r md:p-7">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Current project</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[1] tracking-[-0.05em] text-white md:text-[38px]">
                {currentOrder ? currentOrder.business_name : 'No active project yet.'}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/42">
                {currentOrder
                  ? 'Your latest order becomes the active workspace layer, where project state, structure, files, and delivery signals can be monitored in one place.'
                  : 'Once your first order is submitted, this section becomes the main delivery layer for project structure, stage visibility, and next actions.'}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {currentOrder ? (
                  <>
                    <StatusBadge status={currentOrder.status} />
                    <div className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-white/58">
                      {currentOrder.website_type}
                    </div>
                  </>
                ) : (
                  <div className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-white/58">
                    Awaiting first order
                  </div>
                )}
              </div>
            </div>

            <div className="relative p-6 md:p-7">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:74px_74px]" />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Project path</p>

                <div className="mt-6 space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.label} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-xs text-white/70">
                        {step.done ? <CheckCircle2 className="h-4 w-4 text-white" /> : index + 1}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">{step.label}</p>
                        <p className="mt-1 text-sm leading-6 text-white/40">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {currentOrder ? (
            <div className="grid md:grid-cols-[1.1fr_0.9fr]">
              <div className="border-b border-white/[0.07] p-6 md:border-b-0 md:border-r md:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">
                      Build status
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">Project infrastructure layer</p>
                  </div>
                  <div className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-white/58">
                    Active
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-white/42">Execution progress</span>
                    <span className="text-white/70">56%</span>
                  </div>
                  <div className="h-[4px] rounded-full bg-white/[0.06]">
                    <div className="h-[4px] w-[56%] rounded-full bg-white" />
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    'Project scope recorded',
                    'System direction aligned',
                    'Design-to-build path structured',
                    'Launch workflow prepared',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[20px] border border-white/[0.07] bg-white/[0.02] px-4 py-4"
                    >
                      <p className="text-sm text-white/72">{item}</p>
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="mt-6 h-11 rounded-full border-white/[0.1] bg-white/[0.02] text-white hover:bg-white/[0.05]"
                >
                  <Link href={`/dashboard/orders/${currentOrder.id}`}>
                    Open project workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="p-6 md:p-7">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">
                  Project details
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      label: 'Business',
                      value: currentOrder.business_name,
                    },
                    {
                      label: 'Type',
                      value: currentOrder.website_type,
                    },
                    {
                      label: 'Created',
                      value: formatDate(currentOrder.created_at),
                    },
                    {
                      label: 'Status',
                      value: currentOrder.status,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-[18px] border border-white/[0.07] bg-white/[0.02] px-4 py-3"
                    >
                      <span className="text-sm text-white/42">{row.label}</span>
                      <span className="text-sm text-white/82">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[22px] border border-white/[0.07] bg-black p-4">
                  <p className="text-sm font-medium text-white">Client-grade presentation matters.</p>
                  <p className="mt-2 text-sm leading-6 text-white/40">
                    This workspace is meant to make the whole project feel clearer, more refined,
                    and more serious from the client side.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_1fr]">
              <div className="border-b border-white/[0.07] p-6 md:border-b-0 md:border-r md:p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]">
                  <Rocket className="h-5 w-5 text-white/78" />
                </div>

                <h3 className="mt-6 text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                  Start your first premium build.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/42">
                  Submit a project and unlock a more complete delivery experience with structure,
                  files, communication, and stage visibility in one serious workspace.
                </p>

                <Button
                  asChild
                  className="mt-6 h-11 rounded-full bg-white px-5 text-sm font-medium text-black hover:bg-white/90"
                >
                  <Link href="/dashboard/new-order">Create first order</Link>
                </Button>
              </div>

              <div className="relative p-6 md:p-7">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:74px_74px]" />
                <div className="relative rounded-[24px] border border-white/[0.07] bg-black p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/32">
                      Workspace preview
                    </span>
                    <span className="text-xs text-white/40">Preview</span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="h-10 rounded-full border border-white/[0.07] bg-white/[0.02]" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-24 rounded-[20px] border border-white/[0.07] bg-white/[0.02]" />
                      <div className="h-24 rounded-[20px] border border-white/[0.07] bg-blue-500/[0.08]" />
                      <div className="h-24 rounded-[20px] border border-white/[0.07] bg-white/[0.02]" />
                    </div>
                    <div className="h-40 rounded-[22px] border border-white/[0.07] bg-white/[0.02]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-black">
            <div className="border-b border-white/[0.07] px-6 py-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Quick actions</p>
              <h2 className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.05em] text-white">
                Move the project forward.
              </h2>
            </div>

            <div className="divide-y divide-white/[0.07]">
              {quickActions.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-start gap-4 px-6 py-5 transition-colors duration-300 hover:bg-white/[0.02]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]">
                    <item.icon className="h-4.5 w-4.5 text-white/74" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/40">{item.text}</p>
                  </div>

                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-white/22 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/64" />
                </Link>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-black">
            <div className="border-b border-white/[0.07] px-6 py-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">
                Design principles
              </p>
              <h2 className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.05em] text-white">
                Built like a product.
              </h2>
            </div>

            <div className="grid">
              {principles.map((item, index) => (
                <div
                  key={item.title}
                  className={`px-6 py-5 ${index !== principles.length - 1 ? 'border-b border-white/[0.07]' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]">
                      <item.icon className="h-4.5 w-4.5 text-white/74" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/40">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-black">
          <div className="border-b border-white/[0.07] px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">System layer</p>
            <h2 className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.05em] text-white">
              Delivery flow
            </h2>
          </div>

          <div className="relative px-6 py-6">
            <div className="absolute left-10 top-0 bottom-0 w-px bg-white/[0.06]" />
            <div className="space-y-5">
              {[
                {
                  title: 'Project submitted',
                  text: 'A structured order enters the workspace with clear project context.',
                },
                {
                  title: 'Assets and communication',
                  text: 'Files, references, updates, and messages stay centralized.',
                },
                {
                  title: 'Design and implementation',
                  text: 'The project moves through a more controlled build pipeline.',
                },
                {
                  title: 'Review and delivery',
                  text: 'Final output feels cleaner, more organized, and more professional.',
                },
              ].map((item, index) => (
                <div key={item.title} className="relative pl-12">
                  <div
                    className="absolute left-[3px] top-[7px] h-4 w-4 rounded-full border border-white/[0.1] bg-black"
                    style={{ animation: index === 1 ? 'dashPulse 2.2s ease-in-out infinite' : undefined }}
                  >
                    <div className="absolute inset-[4px] rounded-full bg-white" />
                  </div>

                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-white/40">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-black">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">
                Recent activity
              </p>
              <h2 className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.05em] text-white">
                Orders and project movement
              </h2>
            </div>

            <Link
              href="/dashboard/orders"
              className="inline-flex items-center text-sm text-white/54 transition hover:text-white"
            >
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="p-4">
            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order, index) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="group flex items-center justify-between gap-4 rounded-[24px] border border-white/[0.07] bg-white/[0.02] px-4 py-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.035]"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-black text-xs font-medium text-white/74">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-white">
                          {order.business_name}
                        </h3>
                        <p className="mt-1 text-sm text-white/42">{order.website_type}</p>
                        <p className="mt-1 text-xs text-white/28">{formatDate(order.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <ChevronRight className="h-4 w-4 text-white/24 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/64" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]">
                  <FileText className="h-5 w-5 text-white/70" />
                </div>

                <h3 className="mt-6 text-xl font-medium tracking-[-0.03em] text-white">
                  No orders yet
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/40">
                  Create your first order to start building a cleaner client workflow with structure,
                  visibility, and delivery control.
                </p>

                <Button
                  asChild
                  className="mt-6 h-11 rounded-full bg-white px-5 text-sm font-medium text-black hover:bg-white/90"
                >
                  <Link href="/dashboard/new-order">Create first order</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-black">
        <div className="grid xl:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/[0.07] p-6 md:p-7 xl:border-b-0 xl:border-r">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/32">Infrastructure feel</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-[1.02] tracking-[-0.05em] text-white md:text-[40px]">
              Less decoration.
              <span className="block text-white/74">More system confidence.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/40">
              The goal is to make your dashboard feel closer to a real premium SaaS platform:
              stricter lines, stronger spacing, lower noise, and more confidence in every block.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: Globe, label: 'Global-ready' },
                { icon: BarChart3, label: 'Control-driven' },
                { icon: Activity, label: 'Live system' },
                { icon: Code2, label: 'Built in Next.js' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-white/66"
                >
                  <item.icon className="h-4 w-4 text-white/58" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[300px] p-6 md:p-7">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:86px_86px]" />

            <div className="relative h-full">
              <div className="absolute left-[8%] top-[62%] h-px w-[26%] bg-white/[0.08]" />
              <div className="absolute left-[34%] top-[62%] h-px w-[18%] bg-blue-500/75" />
              <div className="absolute left-[52%] top-[62%] h-px w-[22%] bg-white/[0.08]" />
              <div className="absolute left-[74%] top-[62%] h-px w-[12%] bg-blue-500/75" />

              <div className="absolute left-[34%] top-[61.5%] h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_28px_rgba(59,130,246,0.9)]" />
              <div
                className="absolute left-[74%] top-[61.5%] h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_28px_rgba(255,255,255,0.55)]"
                style={{ animation: 'dashGlow 2.6s ease-in-out infinite' }}
              />
              <div className="absolute left-[52%] top-[46%] h-[16%] w-px bg-gradient-to-b from-blue-500/85 to-transparent" />
              <div className="absolute left-[52%] top-[46%] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-blue-400 shadow-[0_0_28px_rgba(59,130,246,0.9)]" />

              <div className="absolute left-[10%] top-[20%] rounded-full border border-white/[0.08] bg-black px-4 py-2 text-sm text-white/74">
                Intake
              </div>
              <div className="absolute left-[42%] top-[38%] rounded-full border border-white/[0.08] bg-black px-4 py-2 text-sm text-white/74">
                Build
              </div>
              <div className="absolute right-[12%] top-[20%] rounded-full border border-white/[0.08] bg-black px-4 py-2 text-sm text-white/74">
                Launch
              </div>
              <div className="absolute left-[38%] bottom-[14%] rounded-full border border-white/[0.08] bg-black px-4 py-2 text-sm text-white/74">
                Client system
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
