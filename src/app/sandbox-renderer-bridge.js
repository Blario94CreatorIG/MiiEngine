// Native sandbox bridge. This file is bundled with the original MiiEngine renderer,
// but without starting the editor UI (see tools/build-sandbox.js).
globalThis.MiiSandboxNative = {
  THREE: getTHREE(),
  async init() {
    if (!globalThis.__miiSandboxReady) {
      globalThis.__miiSandboxReady = loadFFLResources(true, true, true);
    }
    await globalThis.__miiSandboxReady;
    return true;
  },
  async create(modelData) {
    await this.init();
    if (typeof modelData !== "string" || !modelData) throw new Error("Missing Mii model data.");
    const mii = new Mii(modelData);
    const renderer = getSharedRenderer();
    const model = await createMiiModel({
      data: modelData,
      additionalInfo: getAdditionalInfo(mii),
      renderer,
      module: getFFLModule(),
      shaderType: "switch",
      bodyModelType: "switch",
      drawBody: true,
      isTemporary: false,
      type: ViewType.AllBody,
      expression: 0,
      pose: "Pose.01",
    });
    model.miiGroup.scale.setScalar(0.014);
    model.miiGroup.updateMatrixWorld(true);
    return {
      group: model.miiGroup,
      dispose() {
        model.bodyModelUnBindPose?.();
        model.charModel?.dispose?.();
        model.miiGroup.removeFromParent();
      },
    };
  },
};
