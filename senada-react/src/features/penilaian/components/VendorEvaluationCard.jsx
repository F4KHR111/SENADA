import React from 'react'
import { Card, CardHeader, CardBody } from '../../../components/Card'
import { Badge } from '../../../components/Badge'
import { formatDate } from '../../../utils/formatters'
import { Star, Award, User, Calendar, MessageSquare } from 'lucide-react'

export function VendorEvaluationCard({ evaluation }) {
  if (!evaluation) return null

  const skor = parseFloat(evaluation.skor_akhir || 0)

  const getPredicate = (val) => {
    if (val >= 4.5) return { label: 'Sangat Memuaskan', variant: 'success' }
    if (val >= 3.5) return { label: 'Baik / Memenuhi Syarat', variant: 'info' }
    if (val >= 2.5) return { label: 'Cukup', variant: 'warning' }
    return { label: 'Kurang / Perlu Perbaikan', variant: 'danger' }
  }

  const predicate = getPredicate(skor)

  const renderStarBar = (label, score) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">{label}</span>
          <div className="flex items-center gap-1 font-mono font-bold text-navy-900">
            <span>{score}</span>
            <span className="text-gray-400 font-normal">/ 5</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-navy-700 h-full rounded-full transition-all"
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <Card className="border-navy-200 shadow-xs">
      <CardHeader
        title="Penilaian Kinerja Penyedia (Evaluasi PPK)"
        subtitle="Hasil evaluasi resmi pelaksanaan kontrak setelah serah terima pekerjaan"
        action={
          <Badge variant={predicate.variant} size="sm">
            {predicate.label}
          </Badge>
        }
      />
      <CardBody className="p-6 space-y-6 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-navy-900 to-navy-700 rounded-xl text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <p className="text-[11px] text-gray-300 uppercase tracking-wider font-semibold">
                Skor Akumulatif Kinerja
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-mono text-white">
                  {skor.toFixed(2)}
                </span>
                <span className="text-xs text-gray-300">/ 5.00</span>
                <div className="flex items-center gap-0.5 ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.round(skor)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs sm:text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
            <div className="flex items-center sm:justify-end gap-1.5 text-gray-300 text-[11px]">
              <User className="w-3.5 h-3.5 text-blue-300" />
              <span>
                Penilai: <strong>{evaluation.evaluator?.name || 'PPK'}</strong>
              </span>
            </div>
            {evaluation.evaluator?.employee_id && (
              <p className="text-[10px] text-gray-400 font-mono">
                NIP: {evaluation.evaluator.employee_id}
              </p>
            )}
            <div className="flex items-center sm:justify-end gap-1.5 text-gray-400 text-[10px] pt-1">
              <Calendar className="w-3 h-3" />
              <span>Diterbitkan: {formatDate(evaluation.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Breakdown Skor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {renderStarBar('Kualitas Barang / Jasa', evaluation.kualitas_skor)}
          {renderStarBar('Ketepatan Waktu', evaluation.waktu_skor)}
          {renderStarBar('Layanan & Komunikasi', evaluation.layanan_skor)}
        </div>

        {/* Catatan Evaluator */}
        {evaluation.catatan ? (
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-navy-900 flex items-center gap-1.5 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-navy-500" />
              Catatan & Masukan PPK:
            </span>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              "{evaluation.catatan}"
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">
            Tidak ada catatan tambahan untuk evaluasi ini.
          </p>
        )}
      </CardBody>
    </Card>
  )
}

export default VendorEvaluationCard
