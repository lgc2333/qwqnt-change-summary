import {
  DEFAULT_OUTSIDE_TEXT_CONFIG,
  normalizeOutsideTextConfig,
} from '../shared/outside-text'
import settingsHtml from './settings.html?raw'

const CONFIG_KEYS = ['picOutsideText', 'memeOutsideText'] as const

RendererEvents.onSettingsWindowCreated(async () => {
  const configId = __self.meta.namespace
  const view = await PluginSettings.renderer.registerPluginSettings(
    __self.meta.packageJson,
  )

  view.innerHTML = settingsHtml

  const config = normalizeOutsideTextConfig(
    PluginSettings.renderer.readConfig(configId, DEFAULT_OUTSIDE_TEXT_CONFIG),
  )

  for (const key of CONFIG_KEYS) {
    const input = view.querySelector<HTMLInputElement>(`input[name="${key}"]`)
    if (!input) continue

    input.value = config[key]
    input.addEventListener('change', () => {
      config[key] = input.value
      PluginSettings.renderer.writeConfig(configId, config)
    })
  }
})
