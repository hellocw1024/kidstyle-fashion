import { FaceDetector, ImageClassifier, FilesetResolver } from '@mediapipe/tasks-vision';

let faceDetector: FaceDetector | null = null;
let isLoading = false;
let loadError: Error | null = null;

/**
 * Lazy-load MediaPipe face detection model
 * Only loads once, then caches for subsequent calls
 */
export async function loadMediaPipe(): Promise<void> {
    // Already loaded
    if (faceDetector) return;

    // Already loading
    if (isLoading) {
        // Wait for loading to complete
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return;
    }

    // Previous load failed
    if (loadError) {
        throw loadError;
    }

    try {
        isLoading = true;
        console.log('🔄 Loading MediaPipe face detector...');

        // Load WASM files from CDN
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        // Create face detector
        faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
                delegate: 'GPU'
            },
            runningMode: 'IMAGE',
            minDetectionConfidence: 0.5
        });

        console.log('✅ MediaPipe face detector loaded');
    } catch (error) {
        loadError = error as Error;
        console.error('❌ Failed to load MediaPipe:', error);
        throw error;
    } finally {
        isLoading = false;
    }
}

/**
 * Detect faces in an image
 * @param image - HTMLImageElement to analyze
 * @returns Object with face count and average confidence
 */
export async function detectFaces(
    image: HTMLImageElement
): Promise<{ count: number; confidence: number }> {
    // Ensure model is loaded
    if (!faceDetector) {
        await loadMediaPipe();
    }

    if (!faceDetector) {
        throw new Error('Face detector not available');
    }

    try {
        // Run detection
        const detections = faceDetector.detect(image);

        // Calculate average confidence
        const avgConfidence = detections.detections.length > 0
            ? detections.detections.reduce((sum, d) => sum + (d.categories[0]?.score || 0), 0) / detections.detections.length
            : 0;

        console.log(`🔍 Detected ${detections.detections.length} face(s) with avg confidence ${avgConfidence.toFixed(2)}`);

        return {
            count: detections.detections.length,
            confidence: avgConfidence
        };
    } catch (error) {
        console.error('❌ Face detection failed:', error);
        throw error;
    }
}

/**
 * Check if the browser supports WASM
 */
export function isWasmSupported(): boolean {
    try {
        if (typeof WebAssembly === 'object' &&
            typeof WebAssembly.instantiate === 'function') {
            const module = new WebAssembly.Module(
                Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
            );
            if (module instanceof WebAssembly.Module) {
                return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
            }
        }
    } catch (e) {
        return false;
    }
    return false;
}

// ============================================
// Image Classification (服装识别)
// ============================================

let imageClassifier: ImageClassifier | null = null;
let isClassifierLoading = false;
let classifierLoadError: Error | null = null;

/**
 * 服装相关类别（ImageNet 标签）
 */
const CLOTHING_CATEGORIES = [
    // 上衣类
    't-shirt', 'shirt', 'sweater', 'jacket', 'coat', 'cardigan', 'sweatshirt',
    'jersey', 'blouse', 'vest', 'poncho', 'kimono',
    // 下装类
    'jeans', 'pants', 'skirt', 'shorts', 'trousers',
    // 连衣裙类
    'dress', 'gown', 'robe',
    // 套装类
    'suit', 'uniform', 'apron',
    // 泳装类
    'bikini', 'swimsuit', 'swimming trunks',
    // 配饰类
    'shoes', 'sneakers', 'sandal', 'boot', 'loafer',
    'hat', 'cap', 'bonnet', 'sombrero', 'cowboy hat',
    'scarf', 'bow tie', 'necktie', 'bolo tie',
    'glove', 'mitten', 'sock',
    // 其他
    'hosiery', 'miniskirt', 'pajama'
];

/**
 * Lazy-load MediaPipe image classifier
 */
export async function loadImageClassifier(): Promise<void> {
    // Already loaded
    if (imageClassifier) return;

    // Already loading
    if (isClassifierLoading) {
        while (isClassifierLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return;
    }

    // Previous load failed
    if (classifierLoadError) {
        throw classifierLoadError;
    }

    try {
        isClassifierLoading = true;
        console.log('🔄 正在加载 MediaPipe 图像分类器...');

        // Load WASM files from CDN
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        // Create image classifier
        imageClassifier = await ImageClassifier.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.tflite',
                delegate: 'GPU'
            },
            maxResults: 5,
            runningMode: 'IMAGE'
        });

        console.log('✅ MediaPipe 图像分类器加载完成');
    } catch (error) {
        classifierLoadError = error as Error;
        console.error('❌ 图像分类器加载失败:', error);
        throw error;
    } finally {
        isClassifierLoading = false;
    }
}

/**
 * 分类图片并判断是否为服装
 */
export async function classifyImage(
    image: HTMLImageElement
): Promise<{ isClothing: boolean; topLabel: string; confidence: number; allLabels: string[] }> {
    // Ensure classifier is loaded
    if (!imageClassifier) {
        await loadImageClassifier();
    }

    if (!imageClassifier) {
        throw new Error('图像分类器不可用');
    }

    try {
        // Run classification
        const results = imageClassifier.classify(image);

        if (!results.classifications || results.classifications.length === 0) {
            throw new Error('分类结果为空');
        }

        const categories = results.classifications[0].categories;
        const topCategory = categories[0];
        const topLabel = topCategory.categoryName.toLowerCase();
        const confidence = topCategory.score;

        // 获取前5个标签
        const allLabels = categories.slice(0, 5).map(c => c.categoryName.toLowerCase());

        // 检查是否为服装类别
        const isClothing = allLabels.some(label =>
            CLOTHING_CATEGORIES.some(clothingCat =>
                label.includes(clothingCat) || clothingCat.includes(label)
            )
        );

        console.log(`🔍 图像分类结果: ${topLabel} (置信度 ${(confidence * 100).toFixed(1)}%)`);
        console.log(`📋 所有标签: ${allLabels.join(', ')}`);
        console.log(`👕 是否为服装: ${isClothing ? '是' : '否'}`);

        return {
            isClothing,
            topLabel,
            confidence,
            allLabels
        };
    } catch (error) {
        console.error('❌ 图像分类失败:', error);
        throw error;
    }
}
