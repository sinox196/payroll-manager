import { Injectable, signal, computed } from '@angular/core';

// --- Interfaces mirroring the SQLite DB schema ---

export interface Employee {
  id: number;
  matricule: string;
  full_name: string;
  cin: string;
  phone: string;
  email: string;
  department: string;
  job_position: string;
  contract_type: string;
  base_salary: number;
  biometric_id: number;
  shift_id: number;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  work_days: string[]; // e.g., ["Mon", "Tue", ...]
}

export interface Attendance {
  id: number;
  employee_id: number;
  timestamp: string; // ISO String
  type: 'IN' | 'OUT';
  status: 'Present' | 'Late' | 'Absent';
}

export interface Salary {
  id: number;
  employee_id: number;
  month: string; // YYYY-MM
  base_salary: number;
  worked_hours: number;
  extra_hours: number;
  overtime_pay: number;
  absence_deduction: number;
  late_deduction: number;
  advances: number;
  net_salary: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // --- MOCK DATABASE STATE (Signals) ---
  
  // Initial Mock Data
  private _employees = signal<Employee[]>([
    { id: 1, matricule: 'EMP001', full_name: 'Jean Dupont', cin: 'AB123456', phone: '0600000001', email: 'jean.d@company.com', department: 'IT', job_position: 'Développeur', contract_type: 'CDI', base_salary: 3000, biometric_id: 101, shift_id: 1 },
    { id: 2, matricule: 'EMP002', full_name: 'Sarah Connor', cin: 'CD987654', phone: '0600000002', email: 'sarah.c@company.com', department: 'RH', job_position: 'Manager RH', contract_type: 'CDI', base_salary: 3500, biometric_id: 102, shift_id: 1 },
    { id: 3, matricule: 'EMP003', full_name: 'Paul Martin', cin: 'EF456789', phone: '0600000003', email: 'paul.m@company.com', department: 'Logistique', job_position: 'Chauffeur', contract_type: 'CDD', base_salary: 1800, biometric_id: 103, shift_id: 2 },
  ]);

  private _shifts = signal<Shift[]>([
    { id: 1, name: 'Bureau (Standard)', start_time: '09:00', end_time: '18:00', work_days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] },
    { id: 2, name: 'Matin (Usine)', start_time: '06:00', end_time: '14:00', work_days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] },
  ]);

  private _attendance = signal<Attendance[]>([
    // Some historic data
    { id: 1, employee_id: 1, timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), type: 'IN', status: 'Present' },
  ]);

  private _salaries = signal<Salary[]>([]);

  private _currentUser = signal<{username: string, role: string} | null>(null);

  // --- Exposed Signals ---
  employees = this._employees.asReadonly();
  shifts = this._shifts.asReadonly();
  attendance = this._attendance.asReadonly();
  salaries = this._salaries.asReadonly();
  currentUser = this._currentUser.asReadonly();

  // --- Auth Methods ---
  login(username: string, pass: string): boolean {
    // Mock Auth
    if (username === 'admin' && pass === 'admin') {
      this._currentUser.set({ username: 'Admin', role: 'admin' });
      return true;
    }
    return false;
  }

  logout() {
    this._currentUser.set(null);
  }

  // --- Employee Methods ---
  addEmployee(emp: Omit<Employee, 'id'>) {
    const newId = Math.max(...this._employees().map(e => e.id), 0) + 1;
    this._employees.update(list => [...list, { ...emp, id: newId }]);
  }

  deleteEmployee(id: number) {
    this._employees.update(list => list.filter(e => e.id !== id));
  }

  // --- Shift Methods ---
  addShift(shift: Omit<Shift, 'id'>) {
    const newId = Math.max(...this._shifts().map(s => s.id), 0) + 1;
    this._shifts.update(list => [...list, { ...shift, id: newId }]);
  }

  deleteShift(id: number) {
    this._shifts.update(list => list.filter(s => s.id !== id));
  }

  // --- ZKTeco Mock Sync ---
  // This simulates connecting to 192.168.1.201 and fetching logs
  async syncBiometricDevice(): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate random check-ins for today for all employees
        const today = new Date();
        const newLogs: Attendance[] = [];
        let logId = Math.max(...this._attendance().map(a => a.id), 0) + 1;

        this._employees().forEach(emp => {
          // 80% chance of being present
          if (Math.random() > 0.2) {
            // Random time between 08:30 and 09:30
            const inTime = new Date(today);
            inTime.setHours(8, 30 + Math.floor(Math.random() * 60), 0);
            
            // Random time between 17:00 and 19:00
            const outTime = new Date(today);
            outTime.setHours(17, Math.floor(Math.random() * 120), 0);

            // Determine status
            const status = inTime.getHours() === 9 && inTime.getMinutes() > 15 ? 'Late' : 'Present';

            newLogs.push({
              id: logId++,
              employee_id: emp.id,
              timestamp: inTime.toISOString(),
              type: 'IN',
              status: status
            });
            newLogs.push({
              id: logId++,
              employee_id: emp.id,
              timestamp: outTime.toISOString(),
              type: 'OUT',
              status: 'Present'
            });
          } else {
             // Absent (no logs)
          }
        });

        this._attendance.update(current => [...current, ...newLogs]);
        resolve(newLogs.length);
      }, 2000); // 2 seconds network delay simulation
    });
  }

  // --- Payroll Calculation ---
  calculatePayroll(employeeId: number, month: string) {
    const emp = this._employees().find(e => e.id === employeeId);
    if (!emp) return;

    // Simulate calculation logic
    // In a real app, we would filter attendance logs for the month
    // Here we will generate plausible mock numbers based on the prompt's formula
    
    const base = emp.base_salary;
    const isManager = emp.job_position.includes('Manager');
    
    // Mock values
    const worked_hours = 160 + Math.floor(Math.random() * 20); // ~160-180 hours
    const extra_hours = Math.max(0, worked_hours - 160);
    const overtime_pay = extra_hours * (base / 160) * 1.5; // 1.5x rate
    const absence_days = Math.random() > 0.8 ? 1 : 0; // Random absence
    const absence_deduction = absence_days * (base / 22); // 22 working days
    const late_deduction = Math.random() > 0.7 ? 50 : 0; // Random late fine
    const advances = 0; 

    const net = base + overtime_pay - absence_deduction - late_deduction - advances;

    const newSalary: Salary = {
      id: Math.random(),
      employee_id: emp.id,
      month: month,
      base_salary: base,
      worked_hours: worked_hours,
      extra_hours: extra_hours,
      overtime_pay: parseFloat(overtime_pay.toFixed(2)),
      absence_deduction: parseFloat(absence_deduction.toFixed(2)),
      late_deduction: late_deduction,
      advances: advances,
      net_salary: parseFloat(net.toFixed(2))
    };

    // Remove existing for this month/emp if any
    this._salaries.update(list => list.filter(s => !(s.employee_id === employeeId && s.month === month)));
    // Add new
    this._salaries.update(list => [...list, newSalary]);
  }
}