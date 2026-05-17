export interface SensorReadout {
  sensor_id: string;
  temperatura: number;
  umidade: number;
  status_chuva: string;
  timestamp: Date;
}

export interface Sensor extends SensorReadout {
  nome: string;
  lat: number;
  lng: number;
}