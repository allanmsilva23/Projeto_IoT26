export interface SensorReadout {
  sensor_id: string;
  temperatura: number;
  umidade: number;
  status_chuva: string;
  timestamp: Date;
}