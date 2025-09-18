import { ChartType, Plugin } from 'chart.js';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType = ChartType> {
  }
}

declare const DataLabelsPlugin: Plugin;
export default DataLabelsPlugin;
