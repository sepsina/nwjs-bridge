import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        provideHttpClient(),
        provideCharts(withDefaultRegisterables())
    ]
};
