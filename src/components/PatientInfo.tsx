import React from 'react';
import { User, Calendar, Weight, Ruler, FileText, Pill } from 'lucide-react';
import { PatientData } from '../types/medical';

interface PatientInfoProps {
  patient: PatientData;
  onPatientChange: (patient: PatientData) => void;
}

export const PatientInfo: React.FC<PatientInfoProps> = ({ patient, onPatientChange }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <User className="mr-2" size={20} />
        Patient Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <User size={16} className="inline mr-1" />
            Full Name
          </label>
          <input
            type="text"
            value={patient.name}
            onChange={(e) => onPatientChange({ ...patient, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <Calendar size={16} className="inline mr-1" />
            Age
          </label>
          <input
            type="number"
            value={patient.age}
            onChange={(e) => onPatientChange({ ...patient, age: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <Weight size={16} className="inline mr-1" />
            Weight (kg)
          </label>
          <input
            type="number"
            value={patient.weight}
            onChange={(e) => onPatientChange({ ...patient, weight: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <Ruler size={16} className="inline mr-1" />
            Height (cm)
          </label>
          <input
            type="number"
            value={patient.height}
            onChange={(e) => onPatientChange({ ...patient, height: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <FileText size={16} className="inline mr-1" />
            Medical History
          </label>
          <textarea
            value={patient.medicalHistory.join('\n')}
            onChange={(e) => onPatientChange({ 
              ...patient, 
              medicalHistory: e.target.value.split('\n').filter(item => item.trim()) 
            })}
            rows={4}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter medical history (one item per line)"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <Pill size={16} className="inline mr-1" />
            Current Medications
          </label>
          <textarea
            value={patient.currentMedications.join('\n')}
            onChange={(e) => onPatientChange({ 
              ...patient, 
              currentMedications: e.target.value.split('\n').filter(item => item.trim()) 
            })}
            rows={4}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter medications (one per line)"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">BMI:</span>
            <span className="ml-2 text-white font-mono">
              {patient.weight && patient.height 
                ? (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)
                : 'N/A'
              }
            </span>
          </div>
          <div>
            <span className="text-gray-400">Gender:</span>
            <span className="ml-2 text-white font-mono capitalize">{patient.gender}</span>
          </div>
          <div>
            <span className="text-gray-400">ID:</span>
            <span className="ml-2 text-white font-mono">{patient.id}</span>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <span className="ml-2 text-green-400 font-mono">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};