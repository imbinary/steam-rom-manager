import { Injectable } from '@angular/core';
import { SettingsService } from "../services";
import { languageManager } from "../../shared/lib";
import { gApp } from "../app.global";
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LanguageService {
    private languageChange = new BehaviorSubject<string>(null);

    constructor(private settingsService: SettingsService) {
        this.settingsService.onLoad((appSettings) => {
            gApp.lang = languageManager.getLanguage(appSettings.language);
            this.languageChange.next(appSettings.language);
        });
    }

    observeChanges() {
        return this.languageChange.asObservable();
    }

    getAvailableLanguages() {
        return languageManager.getAvailableLanguages();
    }

    loadLanguage(languageKey: string) {
        if (languageKey !== this.languageChange.getValue()) {
            gApp.lang = languageManager.getLanguage(languageKey);
            this.languageChange.next(languageKey);
        }
    }
}