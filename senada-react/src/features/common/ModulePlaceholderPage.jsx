import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody } from '../../components/Card'
import { Button } from '../../components/Button'
import { ArrowLeft, Clock } from 'lucide-react'

export function ModulePlaceholderPage({
  title = 'Modul Sedang Dalam Pengembangan',
  subtitle = 'Fitur ini telah terdaftar dalam arsitektur hak akses SENADA.',
  moduleName = 'Modul Sistem',
  icon: Icon = Clock,
}) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <Icon className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              {title}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <Card>
        <CardBody className="py-16 px-8 text-center space-y-4">
          <div className="w-14 h-14 bg-navy-50 text-navy-700 rounded-2xl flex items-center justify-center mx-auto border border-navy-100 shadow-xs">
            <Icon className="w-7 h-7 text-navy-700" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-bold text-navy-900">
              {moduleName}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Modul ini siap dikembangkan sesuai alur kerja pengadaan di <strong>AGENTS.md</strong>.
              Hak akses rute dan menu navigasi sidebar telah diisolasi khusus untuk peran Anda.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Link to="/dashboard">
              <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default ModulePlaceholderPage
