import {
  createNode,
  Source,
  VNode,
  VNodeRepresentationSource,
  Fragment,
  isTokenVNodeFn,
} from "@virtualstate/x";
import {
  isGetDocumentNodeOptions,
  isNativeOptions,
  NativeOptions,
  isOnBeforeRenderOptions,
  isAttributesOptions,
} from "@virtualstate/dom";

export function h<O extends object = object>(
  source: Source<O> | VNode,
  options?: O,
  ...children: VNodeRepresentationSource[]
): VNode;
export function h(
  source: Source<object>,
  options?: object,
  ...children: VNodeRepresentationSource[]
): VNode {
  if (isTokenVNodeFn(source)) {
    return h(source(options), options, ...children);
  }

  if (source === "fragment") {
    return h(Fragment, options, ...children);
  }

  if (typeof source === "string" && options && !isNativeOptions(options)) {
    // Please if you have a solution to do this without any, please let me know
    const resultingOptions: Partial<NativeOptions> = {
      type: "Element",
      attributes: {},
    };

    const toJSON = () => ({
      attributes: resultingOptions.attributes,
    });

    Object.defineProperty(resultingOptions, "toJSON", {
      value: toJSON,
      enumerable: false,
    });

    let remainingOptions: object = options;

    if (isGetDocumentNodeOptions(remainingOptions)) {
      const { getDocumentNode, ...nextRemainingOptions } = remainingOptions;
      remainingOptions = nextRemainingOptions;
      resultingOptions.getDocumentNode = getDocumentNode;
    }

    if (isOnBeforeRenderOptions(remainingOptions)) {
      const { onBeforeRender, ...nextRemainingOptions } = remainingOptions;
      remainingOptions = nextRemainingOptions;
      resultingOptions.onBeforeRender = onBeforeRender;
    }

    const finalOptions = {
      attributes: remainingOptions,
    };

    if (isAttributesOptions(finalOptions)) {
      resultingOptions.attributes = finalOptions.attributes;
    }

    return h(source, resultingOptions, ...children);
  }

  return createNode(source, options || {}, ...children);
}
