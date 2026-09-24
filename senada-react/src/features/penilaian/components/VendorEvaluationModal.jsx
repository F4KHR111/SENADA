import React, { useState } from 'react'
import { Modal } from '../../../components/Modal'
import { Button } from '../../../components/Button'
import { useSubmitEvaluation } from '../hooks/usePenilaian'
import { Star, AlertCircle, CheckCircle2, Award } from 'lucide-react'

export function VendorEvaluationModal({ spk, isOpen, onClose, onSuccess }) {
  const submitMutation = useSubmitEvaluation()

  const [kualitas, setKualitas] = useState(5)
  const [waktu, setWaktu] = useState(5)
  const [layanan, setLayanan] = useState(5)
  const [catatan, setCatatan] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const skorAkhir = ((kualitas + waktu + layanan) / 3).toFixed(2)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    try {
      await submitMutation.mutateAsync({
        spkId: spk.id,
        payload: {
          kualitas_skor: kualitas,
          waktu_skor: waktu,
          layanan_skor: layanan,
          catatan: catatan.trim() || null,
        },
      })
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Gagal menyimpan penilaian kinerja vendor.'
      )
    }
  }

  const renderStarInput = (label, description, value, setValue) => {
    return (
      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-navy-900">{label}</h4>
            <p className="text-[11px] text-gray-500">{description}</p>
          </div>
          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs">
            <span className="text-xs font-bold text-navy-900 font-mono">
              {value}
            </span>
            <span className="text-[10px] text-gray-400">/ 5</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= value
            return (
              <button
                key={star}
                type="button"
                onClick={() => setValue(star)}
                className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    isFilled
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300 hover:text-amber-200'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Penilaian Kinerja Penyedia (PPK)"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
        <div className="p-3 bg-navy-50/60 border border-navy-200 rounded-xl flex items-start gap-3">
          <Award className="w-5 h-5 text-navy-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-navy-900 text-xs">
              {spk?.vendor?.company_name}
            </p>
            <p className="text-gray-600 text-[11px] mt-0.5">
              Nomor SPK: <span className="font-mono">{spk?.nomor_spk}</span>
            </p>
            <p className="text-[10px] text-navy-600 mt-1">
              Berdasarkan hasil Berita Acara Serah Terima (BAST), berikan skor objektif terhadap performa rekanan.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="space-y-3">
          {renderStarInput(
            '1. Kualitas Barang / Hasil Kerja',
            'Kesesuaian fisik barang dengan spesifikasi HPS dan ketiadaan cacat mutu.',
            kualitas,
            setKualitas
          )}

          {renderStarInput(
            '2. Ketepatan Waktu Pengiriman',
            'Kecepatan dan kepatuhan jadwal penyerahan barang sebelum batas waktu SPK.',
            waktu,
            setWaktu
          )}

          {renderStarInput(
            '3. Layanan, Koordinasi & Komunikasi',
            'Responsivitas penyedia saat dihubungi dan kelancaran proses administrasi.',
            layanan,
            setLayanan
          )}
        </div>

        {/* Kalkulasi Skor Akhir */}
        <div className="p-3.5 bg-navy-900 text-white rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">
              Skor Akhir Terhitung:
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-lg font-bold font-mono text-amber-300">
                {skorAkhir}
              </span>
              <span className="text-xs text-gray-400">/ 5.00</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-navy-700 text-white font-semibold">
              {skorAkhir >= 4.5
                ? 'Sangat Baik'
                : skorAkhir >= 3.5
                ? 'Baik'
                : skorAkhir >= 2.5
                ? 'Cukup'
                : 'Perlu Perbaikan'}
            </span>
          </div>
        </div>

        {/* Catatan / Feedback PPK */}
        <div className="space-y-1">
          <label className="block font-semibold text-navy-900">
            Catatan Kinerja / Rekomendasi (Opsional)
          </label>
          <textarea
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: Barang tiba dalam kondisi prima, sertifikat garansi lengkap dan vendor sangat kooperatif saat proses uji fungsi."
            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-navy-900 focus:border-transparent outline-hidden resize-none"
          />
        </div>

        <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={submitMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitMutation.isPending}
          >
            Simpan & Terbitkan Penilaian
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default VendorEvaluationModal
