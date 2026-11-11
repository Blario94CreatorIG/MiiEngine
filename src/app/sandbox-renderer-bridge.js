// Native sandbox bridge. Reuses Mii Creator's own FFL renderer, shader and body settings.
globalThis.MiiSandboxNative = {
  THREE: getTHREE(),
  async init() {
    if (!globalThis.__miiSandboxReady) {
      globalThis.__miiSandboxReady = loadFFLResources(true, true, true);
    }
    await globalThis.__miiSandboxReady;
    return true;
  },
  async getAppearance() {
    const [theme, colorScheme, colorSchemeSpace, shaderType, bodyModel] = await Promise.all([
      getRendererSetting("theme"),
      getRendererSetting("colorScheme"),
      getRendererSetting("colorSchemeSpace"),
      getRendererSetting("shaderTypeN"),
      getRendererSetting("bodyModelN"),
    ]);
    return {
      theme: theme || "sw2",
      colorScheme: colorScheme || "auto",
      colorSchemeSpace: colorSchemeSpace || "auto",
      shaderType: shaderType || "switch",
      bodyModel: bodyModel || "miitomo",
    };
  },
  async create(modelData) {
    await this.init();
    if (typeof modelData !== "string" || !modelData.trim()) throw new Error("Missing Mii model data.");
    // Mii Creator sends exportHex("studioData"). Decode it before reading its metadata;
    // createMiiModel accepts either decoded bytes or a hex/base64 string.
    const decodedData = decodeHexOrBase64(modelData);
    const mii = new Mii(decodedData);
    const appearance = await this.getAppearance();
    const renderer = getSharedRenderer();
    const model = await createMiiModel({
      data: decodedData,
      additionalInfo: getAdditionalInfo(mii),
      renderer,
      module: getFFLModule(),
      shaderType: appearance.shaderType,
      bodyModelType: appearance.bodyModel,
      drawBody: true,
      isTemporary: false,
      type: ViewType.AllBody,
      expression: 0,
      pose: "Pose.01",
    });
    if (!model?.miiGroup) throw new Error("Mii Creator did not return a 3D model group.");
    // The native model's body is authored at roughly 100 world units tall.
    model.miiGroup.scale.setScalar(0.014);
    model.miiGroup.updateMatrixWorld(true);
    return {
      group: model.miiGroup,
      appearance,
      dispose() {
        model.bodyModelUnBindPose?.();
        model.charModel?.dispose?.();
        model.miiGroup.removeFromParent();
      },
    };
  },
};