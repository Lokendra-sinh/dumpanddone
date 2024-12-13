
type ModelProperties = { maxTokens: number, targetTokens: number}

interface ModelConfigs {
    claude: ModelProperties,
    deepseek: ModelProperties,
    gpt: ModelProperties,
}

export {
    ModelConfigs,
    ModelProperties,
}