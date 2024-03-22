import 'igniteui-webcomponents/themes/light/bootstrap.css'

import '@webcomponents/custom-elements/custom-elements.min';
import '@webcomponents/custom-elements/src/native-shim.js';

import { html } from 'lit-html';

// Modules
import {
    IgcDataChartInteractivityModule
} from '@infragistics/igniteui-webcomponents-charts';
import {
    IgcGeographicMapModule
} from '@infragistics/igniteui-webcomponents-maps';

// Components
import {
    IgcValueBrushScaleComponent, IgcSizeScaleComponent
} from '@infragistics/igniteui-webcomponents-charts';
import {
    IgcGeographicMapComponent, IgcGeographicProportionalSymbolSeriesComponent
} from '@infragistics/igniteui-webcomponents-maps';

import { MarkerType } from '@infragistics/igniteui-webcomponents-charts';
import { DataContext } from '@infragistics/igniteui-webcomponents-core';

// Core
import { ModuleManager } from '@infragistics/igniteui-webcomponents-core';

ModuleManager.register(
    IgcDataChartInteractivityModule,
    IgcGeographicMapModule
);

declare global {
    interface Window {
        revealBridge: any;
        revealBridgeListener: any;
    }
}

export class SKNextMapChart {

    private geoMap: IgcGeographicMapComponent;
    private _bind: () => void;

    /**
     * Revealから渡されるオリジナルのデータを保持するプロパティです。
     */
    private tabularData: { [key: string]: any; }[] | undefined;

    constructor() {

        this.geoMap = document.getElementById('geoMap') as IgcGeographicMapComponent;

        this._bind = () => {
            // 主にチャート表現やイベントハンドラの初期設定を行っています。
        }
        this._bind();

        window.revealBridgeListener = {
            dataReady: (incomingData: any) => {
                console.log(incomingData); // Reveal から渡されるデータです。
                const columns = incomingData.metadata.columns;
                this.tabularData = this.combineColumnAndData(columns, incomingData.data);
                //console.log(this.tabularData);
                this.addSeriesWith(this.tabularData);

                // 全ての点を含む最小の矩形領域を計算
                const minX = Math.min(...this.tabularData.map(p => p.fX));
                const maxX = Math.max(...this.tabularData.map(p => p.fX));
                const minY = Math.min(...this.tabularData.map(p => p.fY));
                const maxY = Math.max(...this.tabularData.map(p => p.fY));

                // IgRectの計算
                const geographicRect = {
                    left: minX,
                    top: minY,
                    width: maxX - minX,
                    height: maxY - minY
                };
                // IgRectを使用して地理的マップコンポーネントにズーム
                this.geoMap.zoomToGeographic(geographicRect);
            }
        };
        window.revealBridge.notifyExtensionIsReady();

    }

    public addSeriesWith(locations: any[])
    {
        const sizeScale = new IgcSizeScaleComponent();
        sizeScale.minimumValue = 4;
        sizeScale.maximumValue = 60;

        // const brushes = [
        //     'rgba(14, 194, 14, 0.4)',  // semi-transparent green
        //     'rgba(252, 170, 32, 0.4)', // semi-transparent orange
        //     'rgba(252, 32, 32, 0.4)',  // semi-transparent red
        // ];

        // const brushScale = new IgcValueBrushScaleComponent();
        // brushScale.brushes = brushes;
        // brushScale.minimumValue = 0;
        // brushScale.maximumValue = 30;

        const symbolSeries = new IgcGeographicProportionalSymbolSeriesComponent ();
        symbolSeries.dataSource = locations;
        symbolSeries.markerType = MarkerType.Circle;
        symbolSeries.radiusScale = sizeScale;
        //symbolSeries.fillScale = brushScale;
        symbolSeries.fillMemberPath = 'AddPoint';
        symbolSeries.radiusMemberPath = 'AddPoint';
        symbolSeries.latitudeMemberPath = 'fY';
        symbolSeries.longitudeMemberPath = 'fX';
        symbolSeries.markerOutline = 'rgba(58,107,142,0.5)';
        symbolSeries.markerBrush = 'rgba(90,140,201,0.4)';
        symbolSeries.tooltipTemplate = this.createTooltip;

        this.geoMap.series.add(symbolSeries);
    }

    public createTooltip(context: any): any {
        const dataContext = context as DataContext;
        if (!dataContext) return null;

        const dataItem = dataContext.item as any;
        if (!dataItem) return null;

        let tooltip = html`
        <div style="display: 'inline-block', marginLeft: 5">
            <div class='tooltipBox'>
                <div class='tooltipRow'>
                    <div class='tooltipLbl'>Address:</div>
                    <div class='tooltipVal'>${dataItem.AreaName}</div>
                </div>
                <div class='tooltipRow'>
                    <div class='tooltipLbl'>Point:</div>
                    <div class='tooltipVal'>${dataItem.AddPoint}</div>
                </div>
            </div>
        </div>`;

        return tooltip;
    }

    /**
     * カラムとデータを結合する関数です。Revealから取得したデータを整形するために使用します。
     * @param fields - カラムのフィールド情報を含むオブジェクト
     * @param data - 結合するデータ配列
     * @returns - 結合されたデータ配列
     */
    private combineColumnAndData(fields: { [x: string]: {
        type: number; name: string | number;
    }; }, data: any[]) {
        var transformFields = Object.values(fields);
        var transformedData = data;
        return transformedData.map(record => {
            const combinedRecord: { [key: string]: any } = {}; // Add index signature
            record.forEach((value: any, index: string | number) => {
                combinedRecord[transformFields[Number(index)].name] = value;
            });
            return combinedRecord;
        });
    }

}

new SKNextMapChart();
