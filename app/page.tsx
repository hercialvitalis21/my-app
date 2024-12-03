"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// TypeScript interface for Blood Pressure Reading
interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  date: string;
  time: string;
}

const BloodPressureTracker: React.FC = () => {
  const [readings, setReadings] = useState<BPReading[]>([]);
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [medications, setMedications] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<BPReading['timeOfDay']>('morning');
  const [error, setError] = useState<string>('');

  // Load readings from localStorage on component mount
  useEffect(() => {
    const savedReadings = localStorage.getItem('bpReadings');
    if (savedReadings) {
      setReadings(JSON.parse(savedReadings));
    }
    
    // Set default date and time to current
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().split(' ')[0].slice(0,5));
  }, []);

  // Save readings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bpReadings', JSON.stringify(readings));
  }, [readings]);

  const addReading = () => {
    // Validate input
    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);
    const pulseNum = parseInt(pulse);

    if (isNaN(systolicNum) || isNaN(diastolicNum) || isNaN(pulseNum)) {
      setError('Please enter valid numbers');
      return;
    }

    if (systolicNum < 70 || systolicNum > 200 || 
        diastolicNum < 40 || diastolicNum > 120 || 
        pulseNum < 40 || pulseNum > 120) {
      setError('Values out of typical range');
      return;
    }

    if (!date || !time) {
      setError('Please enter a date and time');
      return;
    }

    const newReading: BPReading = {
      id: new Date().toISOString(),
      systolic: systolicNum,
      diastolic: diastolicNum,
      pulse: pulseNum,
      date,
      time
    };

    setReadings([...readings, newReading]);
    
    // Reset form
    setSystolic('');
    setDiastolic('');
    setPulse('');
    setError('');

    // Reset date and time to current
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().split(' ')[0].slice(0,5));
  };

  const deleteReading = (id: string) => {
    setReadings(readings.filter(reading => reading.id !== id));
  };

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if ((systolic >= 120 && systolic <= 129) && diastolic < 80) return 'Elevated';
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return 'Hypertension Stage 1';
    if (systolic >= 140 || diastolic >= 90) return 'Hypertension Stage 2';
    return 'Unknown';
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Blood Pressure Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Systolic (mmHg)</Label>
              <Input 
                type="number" 
                value={systolic} 
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="Systolic"
              />
            </div>
            <div>
              <Label>Diastolic (mmHg)</Label>
              <Input 
                type="number" 
                value={diastolic} 
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="Diastolic"
              />
            </div>
            <div>
              <Label>Pulse (bpm)</Label>
              <Input 
                type="number" 
                value={pulse} 
                onChange={(e) => setPulse(e.target.value)}
                placeholder="Pulse"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Date</Label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div>
                  <Label>Time of Day</Label>
                  <Select value={timeOfDay} onValueChange={(val: BPReading['timeOfDay']) => setTimeOfDay(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time of Day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
          </div>
          <div>
                  <Label>Medications (comma-separated)</Label>
                  <Input 
                    type="text" 
                    value={medications} 
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="e.g. Lisinopril, Amlodipine, Metoprolol"
                  />
                </div>
              <div className="mb-4">
                <Label>Notes</Label>
                <Input 
                  type="text" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional observations"
                />
              </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <Button onClick={addReading} className="w-full">Add Reading</Button>

          {readings.length > 0 && (
            <ResponsiveContainer width="100%" height={300} className="mt-4">
              <LineChart data={readings}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tickItem) => {
                    const date = new Date(tickItem);
                    return date.toLocaleDateString();
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => {
                    const matchingReading = readings.find(r => r.date === label);
                    return matchingReading 
                      ? `${matchingReading.date} ${matchingReading.time}` 
                      : label;
                  }}
                />
                <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2">Recent Readings</h3>
            {readings.slice().reverse().map((reading) => (
              <div 
                key={reading.id} 
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <span>{reading.date} {reading.time}</span>
                  <span className="ml-2">
                    {reading.systolic}/{reading.diastolic} mmHg | {reading.pulse} bpm
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {getBPCategory(reading.systolic, reading.diastolic)}
                  </span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => deleteReading(reading.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BloodPressureTracker;