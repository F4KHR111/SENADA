import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Card, CardBody } from '../../components/Card'
import { Button } from '../../components/Button'

export function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center shadow-card">
        <CardBody className="p-8 space-y-4">
          <div className="w-12 h-12 bg-red-100 text-danger rounded-xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-navy-900">Akses Ditolak (403)</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Peran (role) akun Anda tidak memiliki izin untuk mengakses halaman atau modul ini sesuai matriks pembagian wewenang pengadaan di AGENTS.md §5.
          </p>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default UnauthorizedPage
