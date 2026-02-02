
import { ModelGraph, LayerData } from '../types';

/**
 * Mocks the response from the Python /parse_model endpoint.
 * Generates the structure for bert-base-uncased.
 */

const EXPLANATIONS = {
  Embedding: "将离散的 Token ID 映射到连续的 768 维向量空间，包含 Word, Position, 和 Token Type Embedding。",
  TransformerBlock: "Transformer 编码器的基本单元，包含多头自注意力机制（Self-Attention）和前馈神经网络（FFN）。",
  MultiHeadAttention: "允许模型同时关注输入序列的不同部分（子空间），捕捉长距离依赖关系。BERT base 有 12 个头。",
  FFN: "前馈神经网络 (Feed-Forward Network)，对每个位置的向量独立进行非线性变换，增加模型表达能力。",
  LayerNorm: "层归一化，稳定训练过程，使梯度传播更平滑。",
  Output: "任务特定的输出层（如分类头或掩码预测），将隐藏状态映射回词表或类别概率。"
};

// Pre-defined citations from the original papers to ensure the UI isn't empty
const CITATIONS = {
  Embedding: `To make use of sub-word information, the input is processed using WordPiece embeddings with a 30,000 token vocabulary. The first token of every sequence is always a special classification token ([CLS])... For a given token, its input representation is constructed by summing the corresponding token, segment, and position embeddings.`,
  
  TransformerBlock: `We employ a residual connection around each of the two sub-layers, followed by layer normalization. That is, the output of each sub-layer is **LayerNorm(x + Sublayer(x))**, where Sublayer(x) is the function implemented by the sub-layer itself.`,
  
  MultiHeadAttention: `An attention function can be described as mapping a query and a set of key-value pairs to an output... We compute the matrix of outputs as: 
  
  $$ Attention(Q, K, V) = softmax(\\frac{QK^T}{\\sqrt{d_k}})V $$
  
  Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.`,
  
  FFN: `In addition to attention sub-layers, each of the layers in our encoder and decoder contains a fully connected feed-forward network, which is applied to each position separately and identically. This consists of two linear transformations with a ReLU activation in between.
  
  $$ FFN(x) = max(0, xW_1 + b_1)W_2 + b_2 $$`,
  
  Output: `The final hidden state corresponding to this token is used as the aggregate sequence representation for classification tasks.`
};

const createEncoderBlock = (index: number): LayerData => ({
  id: `encoder_block_${index}`,
  name: `Encoder Block ${index + 1}`,
  type: 'TransformerBlock',
  input_shape: ['batch', 'seq_len', 768],
  output_shape: ['batch', 'seq_len', 768],
  description: EXPLANATIONS.TransformerBlock,
  explanation_card: {
    summary: "Standard Transformer Encoder block.",
    technical: "Stack of Multi-Head Attention + FFN.",
    paper_citation: CITATIONS.TransformerBlock
  },
  sub_layers: [
    {
      id: `block_${index}_attention`,
      name: `Self-Attention`,
      type: 'MultiHeadAttention',
      input_shape: ['batch', 'seq_len', 768],
      output_shape: ['batch', 'seq_len', 768],
      description: EXPLANATIONS.MultiHeadAttention,
      explanation_card: {
          summary: "Captures context from all other tokens.",
          technical: "$O(N^2)$ complexity.",
          paper_citation: CITATIONS.MultiHeadAttention
      }
    },
    {
      id: `block_${index}_ffn`,
      name: `Feed Forward`,
      type: 'FFN',
      input_shape: ['batch', 'seq_len', 768],
      output_shape: ['batch', 'seq_len', 3072], // BERT intermediate size
      description: EXPLANATIONS.FFN,
      explanation_card: {
          summary: "Processes each token individually.",
          technical: "Projects to 4x hidden size (3072) and back.",
          paper_citation: CITATIONS.FFN
      }
    }
  ]
});

export const fetchModelStructure = async (): Promise<ModelGraph> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const layers: LayerData[] = [
    {
      id: 'embedding_layer',
      name: 'Embeddings',
      type: 'Embedding',
      input_shape: ['batch', 'seq_len'],
      output_shape: ['batch', 'seq_len', 768],
      description: EXPLANATIONS.Embedding,
      params: "23M",
      explanation_card: {
        summary: "Maps tokens to vectors.",
        technical: "Lookup table.",
        paper_citation: CITATIONS.Embedding
      }
    }
  ];

  // Add 12 Encoder Blocks
  for (let i = 0; i < 12; i++) {
    layers.push(createEncoderBlock(i));
  }

  layers.push({
    id: 'output_pooler',
    name: 'Output / Pooler',
    type: 'Output',
    input_shape: ['batch', 'seq_len', 768],
    output_shape: ['batch', 'num_classes'],
    description: EXPLANATIONS.Output,
    explanation_card: {
        summary: "Classification head.",
        technical: "Linear projection.",
        paper_citation: CITATIONS.Output
    }
  });

  return {
    model_name: "bert-base-uncased",
    total_params: "110M",
    mode: 'standard',
    layers: layers
  };
};
