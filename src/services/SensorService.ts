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