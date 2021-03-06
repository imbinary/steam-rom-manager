import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, Renderer2, ElementRef, RendererStyleFlags2, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { PreviewService, SettingsService, ImageProviderService } from "../services";
import { PreviewData, PreviewDataApp, PreviewVariables, AppSettings, ImageContent } from "../models";
import { gApp } from "../app.global";
import * as _ from 'lodash';

@Component({
    selector: 'preview',
    templateUrl: '../templates/preview.component.html',
    styleUrls: ['../styles/preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewComponent implements OnDestroy {
    private previewData: PreviewData;
    private appSettings: AppSettings;
    private subscriptions: Subscription = new Subscription();
    private previewVariables: PreviewVariables;
    private filterValue: string = '';
    private scrollingEntries: boolean = false;

    constructor(private previewService: PreviewService, private settingsService: SettingsService, private imageProviderService: ImageProviderService, private changeDetectionRef: ChangeDetectorRef, private renderer: Renderer2, private elementRef: ElementRef) {       
        this.previewData = this.previewService.getPreviewData();
        this.previewVariables = this.previewService.getPreviewVariables();
        this.subscriptions.add(this.previewService.getPreviewDataChange().subscribe(_.debounce(() => {
            this.previewData = this.previewService.getPreviewData();
            this.changeDetectionRef.detectChanges();
        }, 50)));
        this.appSettings = this.settingsService.getSettings();
    }

    generatePreviewData(fromSteam: boolean) {
        this.previewService.generatePreviewData(fromSteam);
    }

    preloadImages() {
        this.previewService.preloadImages();
    }

    ngAfterContentInit() {
        this.setImageSize(this.appSettings.previewSettings.imageZoomPercentage);
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    getImagePool(poolKey: string) {
        return this.previewService.images[poolKey];
    }

    private getBackgroundImage(app: PreviewDataApp, image: ImageContent) {
        if (image == undefined) {
            if (this.previewService.images[app.imagePool].retrieving)
                return require('../images/retrieving-images.svg');
            else
                return require('../images/no-images.svg');
        }
        else {
            if (image.loadStatus === 'notStarted') {
                this.loadImage(app);
                return require('../images/downloading-image.svg');
            }
            else if (image.loadStatus === 'downloading')
                return require('../images/downloading-image.svg');
            else if (image.loadStatus === 'done')
                return image.imageUrl;
            else
                return require('../images/failed-image-download.svg');
        }
    }

    private loadImage(app: PreviewDataApp){
        this.previewService.loadImage(app);
    }

    private getItemClass(app: PreviewDataApp, image: ImageContent) {
        return {
            retrieving: this.previewService.images[app.imagePool].retrieving,
            noImages: !this.previewService.images[app.imagePool].retrieving && image == undefined,
            downloading: image != undefined && image.loadStatus === 'downloading',
            failed: image != undefined && image.loadStatus === 'failed',
            imageLoaded: image != undefined && image.loadStatus === 'done'
        }
    }

    private areImagesAvailable(app: PreviewDataApp) {
        return this.previewService.images[app.imagePool].content.length > (app.steamImage ? 0 : 1);
    }

    private currentImageIndex(app: PreviewDataApp) {
        return app.currentImageIndex + (app.steamImage ? 2 : 1);
    }

    private maxImageIndex(app: PreviewDataApp) {
        return this.getImagePool(app.imagePool).content.length + (app.steamImage ? 1 : 0);
    }

    private get lang() {
        return gApp.lang.preview.component;
    }

    private stopImageRetrieving() {
        this.imageProviderService.instance.stopUrlDownload();
    }

    private setFallbackIcon(imageElement: HTMLImageElement) {
        imageElement.src = require('../images/crossed-eye.svg');
    }

    private save() {
        this.previewService.saveData();
    }

    private remove() {
        this.previewService.remove(false);
    }

    private refreshImages(app: PreviewDataApp) {
        this.previewService.downloadImageUrls([app.imagePool], app.imageProviders);
    }

    private previousImage(app: PreviewDataApp) {
        this.previewService.setImageIndex(app, app.currentImageIndex - 1);
    }

    private nextImage(app: PreviewDataApp) {
        this.previewService.setImageIndex(app, app.currentImageIndex + 1);
    }

    private previousIcon(app: PreviewDataApp) {
        this.previewService.setIconIndex(app, app.currentIconIndex - 1);
    }

    private nextIcon(app: PreviewDataApp) {
        this.previewService.setIconIndex(app, app.currentIconIndex + 1);
    }

    private setImageSize(value: number, save: boolean = false) {
        if (this.elementRef && this.elementRef.nativeElement) {
            if (typeof value === 'string')
                value = parseFloat(value);

            if (value <= 100) {
                if (value < 30)
                    value = 30;
            }
            else
                value = 100;

            this.appSettings.previewSettings.imageZoomPercentage = value;

            if (save) {
                this.settingsService.saveAppSettings();
            }

            this.renderer.setStyle(this.elementRef.nativeElement, '--preview-image-size', value / 100, RendererStyleFlags2.DashCase);
        }
    }

    private onScrollEnd = _.debounce(() => {
        this.scrollingEntries = false;
        this.changeDetectionRef.detectChanges();
    }, 150);

    private onScroll() {
        this.scrollingEntries = true;
        this.onScrollEnd();
    }
}