import {type AxiosInstance } from 'axios';
import ApiClient from './api';
import {type SensorReadout } from '../interfaces/SensorReadout';


export class SensorService {
  private api: AxiosInstance;

  constructor() {
    this.api = ApiClient.getInstance();
  }


  public async getHistory(): Promise<SensorReadout[]> {
    const { data } = await this.api.get<SensorReadout[]>('/rainsafe/historico');
    return data;
  }
  public async getLatest(id:string): Promise<SensorReadout|any> {
    try{
        const { data } = await this.api.get<SensorReadout>(`/rainsafe/sensor/${id}`);
        console.log(`Dados do sensor ${id}:`, data);
        return data;
    } catch (error) {
      console.error(`Erro ao buscar dados do sensor ${id}:`, error);
      return error;
    }
  }


  public async createDevice(device: any): Promise<void> {
    await this.api.post('/rainsafe/dispositivos', device);
  }
  public async getDevices(): Promise<any[]> {
    const { data } = await this.api.get('/rainsafe/dispositivos');
    return data;
  }

  public async createSensor(sensor: Partial<SensorReadout>): Promise<void> {
    await this.api.post('/rainsafe/sensores', sensor);
  }

  public async updateSensor(id: string, sensor: Partial<SensorReadout>): Promise<void> {
    await this.api.put(`/rainsafe/sensores/${id}`, sensor);
  }
  public async deleteSensor(id: string): Promise<void> {
    await this.api.delete(`/rainsafe/sensores/${id}`);
  }
}