import { Component, inject, signal } from '@angular/core';
import { ApiService, Salary } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Controls -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
           <h3 class="text-lg font-bold text-gray-800 mb-4">Génération Paie</h3>
           
           <div class="mb-4">
             <label class="block text-sm font-medium text-gray-700 mb-1">Mois</label>
             <input type="month" [(ngModel)]="selectedMonth" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
           </div>
           
           <div class="mb-6">
             <label class="block text-sm font-medium text-gray-700 mb-1">Employé</label>
             <select [(ngModel)]="selectedEmpId" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option [value]="0">-- Sélectionner --</option>
                @for (emp of api.employees(); track emp.id) {
                  <option [value]="emp.id">{{ emp.full_name }} ({{ emp.matricule }})</option>
                }
             </select>
           </div>

           <button (click)="calculate()" [disabled]="selectedEmpId === 0" class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-500/30 transition-all flex justify-center items-center">
             <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
             Calculer Salaire
           </button>
        </div>
      </div>

      <!-- Result / Slip -->
      <div class="lg:col-span-3">
         @if (currentSalary()) {
           <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" id="payslip">
             <!-- Slip Header -->
             <div class="bg-slate-800 text-white p-6 flex justify-between items-start">
                <div>
                  <h2 class="text-2xl font-bold tracking-wide">Bulletin de Paie</h2>
                  <p class="text-slate-300">Mois: {{ currentSalary()?.month }}</p>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-green-400">{{ currentSalary()?.net_salary }} TND</div>
                  <p class="text-xs text-slate-400 uppercase tracking-widest">Net à Payer</p>
                </div>
             </div>

             <!-- Employee Info -->
             <div class="p-6 bg-gray-50 border-b border-gray-200 grid grid-cols-2 gap-4 text-sm">
                <div>
                   <span class="block text-gray-500">Nom Complet</span>
                   <span class="font-bold text-gray-800">{{ getEmpName(currentSalary()!.employee_id) }}</span>
                </div>
                 <div>
                   <span class="block text-gray-500">Matricule</span>
                   <span class="font-bold text-gray-800">EMP-{{ currentSalary()!.employee_id }}</span>
                </div>
             </div>

             <!-- Details -->
             <div class="p-6">
               <table class="w-full text-sm">
                 <thead>
                   <tr class="border-b-2 border-gray-100 text-gray-500">
                     <th class="text-left py-2">Désignation</th>
                     <th class="text-right py-2">Base / Taux</th>
                     <th class="text-right py-2">Montant (+)</th>
                     <th class="text-right py-2">Retenue (-)</th>
                   </tr>
                 </thead>
                 <tbody class="divide-y divide-gray-50">
                   <tr>
                     <td class="py-3">Salaire de Base</td>
                     <td class="text-right"></td>
                     <td class="text-right font-medium">{{ currentSalary()!.base_salary }}</td>
                     <td class="text-right"></td>
                   </tr>
                   <tr>
                     <td class="py-3">Heures Supplémentaires</td>
                     <td class="text-right text-gray-500">{{ currentSalary()!.extra_hours }}h</td>
                     <td class="text-right font-medium text-green-600">{{ currentSalary()!.overtime_pay }}</td>
                     <td class="text-right"></td>
                   </tr>
                   <tr>
                     <td class="py-3">Absences</td>
                     <td class="text-right text-gray-500"></td>
                     <td class="text-right"></td>
                     <td class="text-right font-medium text-red-500">{{ currentSalary()!.absence_deduction }}</td>
                   </tr>
                   <tr>
                     <td class="py-3">Retards / Pénalités</td>
                     <td class="text-right text-gray-500"></td>
                     <td class="text-right"></td>
                     <td class="text-right font-medium text-red-500">{{ currentSalary()!.late_deduction }}</td>
                   </tr>
                    <tr>
                     <td class="py-3">Avances sur salaire</td>
                     <td class="text-right text-gray-500"></td>
                     <td class="text-right"></td>
                     <td class="text-right font-medium text-red-500">{{ currentSalary()!.advances }}</td>
                   </tr>
                 </tbody>
                 <tfoot class="border-t-2 border-gray-100 font-bold text-gray-800">
                    <tr>
                      <td class="py-4">TOTAL</td>
                      <td class="text-right"></td>
                      <td class="text-right text-green-700">{{ (currentSalary()!.base_salary + currentSalary()!.overtime_pay).toFixed(2) }}</td>
                      <td class="text-right text-red-700">{{ (currentSalary()!.absence_deduction + currentSalary()!.late_deduction + currentSalary()!.advances).toFixed(2) }}</td>
                    </tr>
                 </tfoot>
               </table>
             </div>
             
             <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
               <button class="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Télécharger PDF
               </button>
             </div>
           </div>
         } @else {
           <div class="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl shadow-sm border border-dashed border-gray-300 min-h-[400px]">
             <svg class="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             <p>Sélectionnez un employé et un mois pour générer le bulletin.</p>
           </div>
         }
      </div>
    </div>
  `
})
export class PayrollComponent {
  api = inject(ApiService);
  
  selectedEmpId = 0;
  selectedMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  currentSalary = signal<Salary | undefined>(undefined);

  calculate() {
    if (this.selectedEmpId !== 0) {
      this.api.calculatePayroll(Number(this.selectedEmpId), this.selectedMonth);
      
      // Update local view
      const s = this.api.salaries().find(s => s.employee_id == this.selectedEmpId && s.month === this.selectedMonth);
      this.currentSalary.set(s);
    }
  }

  getEmpName(id: number): string {
    return this.api.employees().find(e => e.id === id)?.full_name || '';
  }
}