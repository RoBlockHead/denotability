import { AnyObject } from "https://cdn.skypack.dev/-/chart.js@v3.7.1-M72rzhHM5HB6TMxMHjbt/dist=es2019,mode=types/types/basic.d.ts";

export type Coordinate = { x: number, y: number };
export type Curve = {
    uuid: string,
    color: string,
    numPoints: number,
    points: Coordinate[]
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
    NBNoteTakingSessionLastUsedFontKey: unknown,
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
type NSMutableString = NSString & {}

type FormattedString = NSObject & {
    formatVersion: number,
    formattedStringTextAlignmentKey: number,
    attributedString: unknown,
    NBAttributedBackingString: unknown,
    "Handwriting Overlay": HandwritingObject,
    reflowState: NBReflowStateLocked,
    didBecomeReflowable: boolean,
    pdfFiles: NSArray<PDFFile>,
    mediaObjects: NSArray<unknown>,
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
type NBReflowStateLocked = NBReflowState & {}
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