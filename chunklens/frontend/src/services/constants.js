export const METHODS = [
  {
    id: 'fixed',
    name: 'Fixed-size',
    short: 'Fixed',
    subtitle: 'Token-count splitting',
    color: '#f59e0b',
    colorVar: 'var(--fixed)',
    icon: '▦',
    description:
      'Splits text into chunks of a fixed word/token count, with configurable overlap to preserve boundary context. The simplest and fastest approach, but entirely blind to content meaning.',
    pros: ['Extremely fast', 'Predictable chunk sizes', 'Zero dependencies', 'Easy to tune'],
    cons: ['Cuts mid-sentence', 'Ignores semantics', 'Context loss at boundaries', 'Poor for structured docs'],
    complexity: 'Low',
    speed: 5,
    quality: 2,
    cost: 5,
    structure: 1,
    useCase: 'Quick prototyping, uniform documents, high-volume pipelines where speed matters most.',
  },
  {
    id: 'recursive',
    name: 'Recursive Split',
    short: 'Recursive',
    subtitle: 'Hierarchical delimiter splitting',
    color: '#6366f1',
    colorVar: 'var(--recursive)',
    icon: '⟲',
    description:
      'Attempts to split on the largest natural boundary (paragraphs), then falls back to sentences, words, and characters. Produces more coherent chunks than fixed-size while maintaining size constraints.',
    pros: ['Respects natural boundaries', 'Configurable separator hierarchy', 'Good coherence', 'Widely adopted'],
    cons: ['Still size-limited', 'Uneven chunk sizes', 'No semantic awareness', 'Separator-dependent'],
    complexity: 'Medium',
    speed: 4,
    quality: 3,
    cost: 5,
    structure: 2,
    useCase: 'General-purpose RAG, markdown documents, code files, mixed-content text.',
  },
  {
    id: 'semantic',
    name: 'Semantic',
    short: 'Semantic',
    subtitle: 'Similarity-based splitting',
    color: '#10b981',
    colorVar: 'var(--semantic)',
    icon: '◎',
    description:
      'Computes similarity between consecutive sentences and starts a new chunk whenever a significant semantic shift is detected. Groups topically coherent content into the same chunk.',
    pros: ['Topic-aware boundaries', 'High coherence', 'Content-preserving', 'Meaning-driven'],
    cons: ['Requires embedding/similarity', 'Variable chunk sizes', 'Threshold sensitivity', 'Slower processing'],
    complexity: 'High',
    speed: 2,
    quality: 4,
    cost: 3,
    structure: 3,
    useCase: 'Long-form content, research papers, books, any document with distinct topical shifts.',
  },
  {
    id: 'pageindex',
    name: 'PageIndex',
    short: 'PageIndex',
    subtitle: 'Tree-indexed, LLM-navigated',
    color: '#a78bfa',
    colorVar: 'var(--pageindex)',
    icon: '⟡',
    description:
      "Builds a hierarchical tree index preserving the document's natural structure. Instead of chunking, an LLM navigates the tree like a human expert reading a table of contents — no arbitrary splits, no information loss.",
    pros: ['Full structure preserved', 'LLM-guided retrieval', 'No boundary artifacts', 'Handles complex docs'],
    cons: ['LLM required at index time', 'Higher latency', 'More complex setup', 'Cost at scale'],
    complexity: 'Very High',
    speed: 1,
    quality: 5,
    cost: 1,
    structure: 5,
    useCase: 'Technical manuals, legal documents, medical records — any domain where structure carries meaning.',
  },
]

export const SAMPLE_TEXTS = [
  {
    label: 'AI & RAG Overview',
    text: `Artificial intelligence has transformed how we process and understand information at scale. Large language models, trained on vast corpora of text, have demonstrated remarkable capabilities in natural language understanding, reasoning, and generation across dozens of domains.

The architecture of these systems relies on the transformer mechanism, introduced in the seminal 2017 paper "Attention Is All You Need." This mechanism allows models to weigh the importance of different tokens relative to each other when making predictions, enabling long-range dependencies to be captured efficiently.

Retrieval-Augmented Generation (RAG) is a technique that combines the parametric knowledge stored in neural network weights with non-parametric knowledge stored in external databases. When a user query is received, relevant documents are retrieved from the knowledge base and used as context for the language model's response generation.

Vector databases store high-dimensional numerical embeddings that represent semantic meaning. When a query arrives, it is embedded into the same vector space, and approximate nearest-neighbor search algorithms find the most semantically similar stored vectors within milliseconds.

Document chunking is a critical preprocessing step in RAG pipelines. The way a document is divided into segments dramatically affects retrieval quality, context coherence, latency, and overall system performance in downstream tasks.

PageIndex takes a fundamentally different approach to this problem. Rather than destroying document structure through arbitrary chunking, it builds a hierarchical tree index that preserves the natural organization of information, enabling LLM-guided navigation through sections — much like how a human expert would consult a textbook.

Evaluating RAG systems requires careful consideration of multiple metrics: faithfulness to the retrieved context, answer relevancy, context precision, and context recall. Each chunking strategy produces different tradeoffs across these dimensions, making the choice highly task-dependent.`,
  },
  {
    label: 'Neural Networks',
    text: `Neural networks are computational systems loosely inspired by the biological neural networks in animal brains. They consist of layers of interconnected nodes, each performing a simple mathematical operation before passing results to the next layer.

The training process involves feeding data through the network, comparing outputs to expected results, and using backpropagation to adjust connection weights to minimize error. This process repeats millions of times across large datasets.

Convolutional neural networks excel at image recognition tasks. They apply learned filters across spatial regions of an image, building up hierarchical representations from edges and textures to complex objects and scenes.

Recurrent neural networks process sequential data by maintaining a hidden state that captures information from previous time steps. LSTMs and GRUs address the vanishing gradient problem that plagued early recurrent architectures.

Transformers replaced recurrent networks for most sequence modeling tasks. The self-attention mechanism allows every token to attend to every other token simultaneously, enabling massive parallelism during training on modern GPU hardware.

Generative models learn to produce new data samples that resemble the training distribution. Variational autoencoders, generative adversarial networks, and diffusion models each take distinct approaches to this fundamental problem.`,
  },
  {
    label: 'Climate Science',
    text: `Climate change refers to long-term shifts in global temperatures and weather patterns. While some variation is natural, scientific evidence overwhelmingly indicates that human activities have been the dominant driver of climate change since the mid-twentieth century.

The greenhouse effect occurs when certain gases in the Earth's atmosphere trap heat from the sun. Carbon dioxide, methane, nitrous oxide, and water vapor are the primary greenhouse gases. Industrial emissions have significantly increased the concentration of these gases.

Rising global temperatures have cascading effects on Earth's systems. Glaciers and ice sheets are melting at accelerating rates, contributing to sea level rise. Ocean warming affects marine ecosystems, coral bleaching, and storm intensification.

Adaptation strategies focus on adjusting human systems to cope with current and projected climate impacts. These include building seawalls, developing drought-resistant crops, redesigning urban infrastructure, and creating early warning systems for extreme weather events.

Mitigation efforts aim to reduce the sources of greenhouse gas emissions. Transitioning to renewable energy, improving energy efficiency, protecting forests, and changing agricultural practices are among the most impactful mitigation strategies available today.

International cooperation is essential for addressing climate change effectively. The Paris Agreement represents a landmark accord where nations committed to limiting global warming, though implementation gaps remain significant and the targets are increasingly difficult to meet.`,
  },
]

export const METHOD_COLORS = {
  fixed: '#f59e0b',
  recursive: '#6366f1',
  semantic: '#10b981',
  pageindex: '#a78bfa',
}
