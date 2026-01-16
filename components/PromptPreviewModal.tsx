import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from './Button';

interface PromptPreviewModalProps {
    prompt: string;
    negativePrompt?: string;
    parameters?: Record<string, any>;
    onConfirm: () => void;
    onCancel: () => void;
}

export const PromptPreviewModal: React.FC<PromptPreviewModalProps> = ({
    prompt,
    negativePrompt,
    parameters,
    onConfirm,
    onCancel
}) => {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">🔍 提示词预览</h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Main Prompt */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700">正向提示词</label>
                            <button
                                onClick={() => copyToClipboard(prompt)}
                                className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-gray-600 hover:text-rose-600 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check size={14} />
                                        已复制
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        复制
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                                {prompt}
                            </pre>
                        </div>
                        <p className="text-xs text-gray-500">
                            字符数: {prompt.length}
                        </p>
                    </div>

                    {/* Negative Prompt */}
                    {negativePrompt && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-700">负向提示词</label>
                                <button
                                    onClick={() => copyToClipboard(negativePrompt)}
                                    className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-gray-600 hover:text-rose-600 transition-colors"
                                >
                                    <Copy size={14} />
                                    复制
                                </button>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                                    {negativePrompt}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Parameters */}
                    {parameters && Object.keys(parameters).length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">生成参数</label>
                            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(parameters).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-600">{key}:</span>
                                            <span className="text-xs font-mono text-gray-800">
                                                {(() => {
                                                    try {
                                                        return typeof value === 'object' ? JSON.stringify(value) : String(value);
                                                    } catch (e) {
                                                        return '[Complex Object]';
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            <p className="font-semibold">请确认提示词无误后开始生成</p>
                            <p className="text-xs mt-1">生成将消耗 1 个配额</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={onCancel}
                            >
                                取消
                            </Button>
                            <Button
                                variant="primary"
                                onClick={onConfirm}
                            >
                                确认生成
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
