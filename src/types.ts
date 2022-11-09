import { NumberParsingError } from "https://esm.sh/v96/pdf-lib@1.17.1/cjs/index.d.ts";

type AnyObject = {
    [x: string]: unknown;
};

export type Coordinate = { x: number, y: number };


export type Point = Coordinate & {
    fractionalWidth?: number // 
    realWidth?: number // pageWidth divided by fractional width
};
export type Curve = {
    uuid: string,
    color: string,
    numPoints: number,
    points: Point[]
    width: number,
};
export type Note = {
    hasAudio?: boolean,
    audioFilePaths?: string[],
    template: {
        enabled: boolean,
        path: string | undefined,
    },
    curves: Curve[],
}

type ByteData = Uint8Array;
type ClassData = {
    $classname: string,
    $classes?: string[]
}
export type NoteTakingSession = NSObject & {
    paperLineStyle: number,
    NBNoteTakingSessionMinorVersionNumberKey: number,
    NBNoteTakingSessionLastUsedFontKey: GLFontDescriptor,
    NBNoteTakingSessionDocumentPaperLayoutModelKey: NotabilityNoteDocumentPaperLayoutModel,
    tags: string,
    paperIndex: number,
    NBNoteTakingSessionHandwritingLanguageKey: string,
    kNBNoteTakingSessionNoteLinkStoreKey: unknown,
    contentPlaybackEventManager: NBCPEventManager,
    NBNoteTakingSessionIsHighlighterBehindTextKey: boolean,
    subject: string,
    packagePath: string | {
        $class: ClassData,
        "NS.bytes": ByteData
    },
    isReadOnly: boolean,
    sessionFormatVersion: number,
    name: NSMutableString,
    NBPaperMinorVersionNumber: number,
    richText: FormattedString,
    creationData: NSDate,
    NBNoteTakingSessionAllowHighlighterConversionKey: boolean,
    NBNoteTakingSessionBundleVersionNumberKey: string,
    NBPaperMajorVersionNumber: number
}

type NSObject = AnyObject & {
    $class: ClassData
}
type NBCPEventManager = NSObject & {
    NBCPTimeManagerSOAEventUUIDsKey: ByteData,
    NBCPTimeManagerSOATimestampsKey: ByteData,
    NBCPTimeManagerSOANumEventsKey: number,
    NBCPTimeManagerSOARecordingIDsKey: ByteData,
    NBCPTimeManagerSOADurationsKey: ByteData,
}
type NSString = string | (NSObject & {
    "NS.bytes": ByteData
})
type NSMutableString = NSString

type FormattedString = NSObject & {
    formatVersion: number,
    formattedStringTextAlignmentKey: number,
    attributedString: unknown,
    NBAttributedBackingString: unknown,
    "Handwriting Overlay": HandwritingObject,
    reflowState: NBReflowStateLocked,
    didBecomeReflowable: boolean,
    pdfFiles: NSArray<PDFFile>,
    mediaObjects: NSArray<GenericMediaObject | ImageMediaObject | WebMediaObject | CanvasMediaObject>,
    recordingTimestampString: NSMutableDictionary,
    pageLayoutArray: NSMutableArray<unknown>,
}
type NotabilityPaperAttributes = NSObject & {
    paperIdentifier: string,
    drawRotatedForOrientation: boolean,
    lineStyle: number,
    paperOrientation: "portrait" | "landscape",
    paperSizingBehavior: string,
    alignsTextToLines: boolean,
    lineStyle2: string,
}
type NotabilityNoteDocumentPaperLayoutModel = NSObject & {
    documentPaperAttributes: NotabilityPaperAttributes,
    pageLayoutArray: NSArray<unknown>,
}
type NSArray<T> = NSObject & {
    "NS.objects": T[],
}
type NSMutableArray<T> = NSArray<T>;
type NSDate = NSObject & {
    "NS.time": number
}
type NSDictionary = NSObject & {
    "NS.keys": string[],
    "NS.objects": NSObject[],
}
type NSMutableDictionary = NSDictionary;
type NBReflowState = NSObject & {
    pageWidthInDocumentCoordsKey: number,
    nativeLayoutDeviceStringKey: string,
}
type NBReflowStateLocked = NBReflowState
type PDFFile = NSObject & {
    pdfFileName: string,
    contentBoxVersion: number,
    highlights: NSArray<unknown>,
    type: number,
    version: number,
}
type InkedSpatialHash = {
    numCurves: number,
    options: ByteData,
    numFractionalWidths: number,
    groupsArrays: unknown,
    curvespoints: ByteData,
    curveUUIDs: ByteData,
    curvescolors: ByteData,
    curvesfractionalwidths: ByteData,
    curvesnumpoints: ByteData,
    shapes?: ByteData,
    dashStyles?: ByteData,
    $class: ClassData,
    curveswidth: ByteData,
    curvesstyles: ByteData,
    bezierPathsDataDictionary: {
        "NS.keys": number[],
        "NS.objects": ByteData[]
        $class: ClassData,
    },
    numpoints: number
}
type HandwritingObject = NSObject & {
    SpatialHash: InkedSpatialHash,
}

type GenericMediaObject = NSObject & {
    unscaledContentSize: string,
    captionFontColorCrossPlatform: string,
    isCaptionEnabled: boolean,
    captionIsUnderlined: boolean,
    captionFieldText: unknown,
    captionFontName: string,
    captionFontSize: number,
    captionFontColor: UIColor,
    rotationDegrees: number,
    documentOrigin: string,
    documentContentOrigin: string,
    minDimension: number,
    textWrapMode: number,
    assetsIdKey: NSMutableString,
    handwritingZIndecesKey: NSMutableArray<unknown>,
    cornerMode: number,
    UUID: NSUUID,
    zIndex: NumberParsingError,
    maxDimension: number
};
type ImageMediaObject = GenericMediaObject & {
    figure: Figure,
    indexable: boolean,
}
type CanvasMediaObject = GenericMediaObject & {
    kCanvasMediaObjectPaperAttributes: NotabilityPaperAttributes,
    paperIndex: number,
    lineStyle: number
}
type TextBlockMediaObject = CanvasMediaObject & {
    textStore: FormattedString,
}
type NotabilityMathMediaObject = GenericMediaObject & {
    latex: string
}
type WebMediaObject = ImageMediaObject & {
    URLNavigationIndex: number,
    url: string,
    figure: Figure,
    siteTitle: unknown,
    URLNavigationArray: NSMutableArray<unknown>
}
type Figure = NSObject & {
    kFigurePrimitiveObjectsArrayKey: NSMutableArray<unknown>
    FigureObjectTypeKey: number,
    FigureCanvasSizeKey: string,
    FigureCropRectKey: string,
    $0: unknown,
    FigureBackgroundObjectKey: ImageObject,
}

type DrawObject = NSObject & {
    fillColorCrossPlatform: string,
    fillColor: UIColor,
    strokeAlpha: number,
    strokeWidth: number,
    strokeColor: UIColor,
    fillAlpha: number,
    strokeColorCrossPlatform: string,
    rect: string
}
type ImageObject = DrawObject & {
    kImageObjectSnapshotKey: GLSnapshot,
}
type GLSnapshot = NSObject & {
    saveAsJPEG: boolean,
    imageIsMissing: boolean,
    relativePath: string
}
type GLFontDescriptor = NSObject & {
    GLFontDescriptorUnderlined: boolean,
    GLFontDescriptorFamily: string,
    GLFontDescriptorBold: boolean,
    GLFontDescriptorIndentDecorationStyle: number,
    GLFontDescriptorName: string,
    GLFontDescriptorIndentLevel: number,
    GLFontDescriptorLineSpacing: number,
    GLFontDescriptorExpanded: boolean,
    GLFontDescriptorItalic: boolean,
    GLFontDescriptorColor: UIColor,
    GLFontDescriptorCondensed: boolean,
    GLFontDescriptorSize: number,
    GLFontDescriptorShadowColor: unknown,
    GLFontDescriptorShadowOpacity: number,
    GLFontDescriptorShadowRadius: number,
    GLFontDescriptorShadowOffset: string,
}
type UIColor = NSObject & {
    UIColorComponentCount: number,
    UIRed: number,
    UIGreen: number,
    UIBlue: number,
    UIAlpha: 0,
    NSColorSpace: number
    NSRGB: ByteData
}
type NSUUID = NSObject & {
    "NS.uuidbytes": ByteData
}