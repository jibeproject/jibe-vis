class ScenarioSettings {
  city: string;
  scenario_settings: { [key: string]: any };
  fallbackCity: string;
  fallbackParams: { [key: string]: any };

  constructor() {
    this.city = '';
    this.scenario_settings = {};
    this.fallbackCity = 'Melbourne';
    this.fallbackParams = {};
  }

  initialize(searchParams: URLSearchParams, stories: any[], cities: { [key: string]: any }) {
    this.fallbackParams = cities[this.city as keyof typeof cities] || cities[this.fallbackCity];
    const pathway = searchParams.get('pathway')||stories[1].page;
    const story = stories.find((story) => story.page === pathway);
    if (story && story.params) {
      this.scenario_settings = story.params;
      this.city = searchParams.get('city') || this.scenario_settings['city'] || this.fallbackCity;
    } else {
      this.scenario_settings = {};
      this.city = searchParams.get('city') || this.fallbackCity;
    }
    ['title', 'page', 'type', 'img', 'authors', 'story'].forEach(attribute => {
        if (story && story[attribute] !== undefined) {
          this.scenario_settings[attribute] = story[attribute];
        } else {
          this.scenario_settings[attribute] = undefined
        }
      });
    this.scenario_settings.steps = this.scenario_settings.steps || [];
    this.scenario_settings.hints = this.scenario_settings.hints || [];
    this.scenario_settings.layers = this.scenario_settings.layers || [];
    this.scenario_settings.legend_layer = this.scenario_settings.legend_layer || 0;
    console.log(this.scenario_settings.layers);

    if (!this.scenario_settings.dictionary) {
      if (this.scenario_settings.layers.length > 0) {
        this.scenario_settings.dictionary = this.scenario_settings.layers[this.scenario_settings.legend_layer].dictionary;
      } else {
        this.scenario_settings.dictionary = {};
      }
    }

    if (this.scenario_settings.layers.length > 0 && this.scenario_settings.legend_layer >= 0 && this.scenario_settings.legend_layer < this.scenario_settings.layers.length) {
      const layer = this.scenario_settings.layers[this.scenario_settings.legend_layer];
      this.scenario_settings.focus = this.scenario_settings.focus || (layer && layer.focus) || {};
    } else {
      this.scenario_settings.focus = {};
    }
  }

  get(params?: string[]) {
    if (!params) {
      return { ...this.scenario_settings, ...this.fallbackParams };
    }

    const settings: { [key: string]: any } = {};
    params.forEach(param => {
      settings[param] = this.scenario_settings[param] || this.fallbackParams[param];
    });

    return settings;
  }
}

export default ScenarioSettings;