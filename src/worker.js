import {
  AutoTokenizer,
  AutoModelForCausalLM,
  TextStreamer,
  InterruptableStoppingCriteria,
} from "@huggingface/transformers";

class TextGenerationPipeline {
  static instances = {};
  
  static MODEL_CONFIGS = {
    'gemma-2-2b-jpn-it': {
      model_id: "onnx-community/gemma-2-2b-jpn-it",
      model_config: {
        dtype: "q4f16",
        device: "webgpu",
        use_external_data_format: true
      },
      generation_config: {
        do_sample: false,
        max_new_tokens: 1024
      }
    },
    'SmolLM2-135M-Instruct': {
      model_id: "HuggingFaceTB/SmolLM2-135M-Instruct",
      model_config: {
        dtype: "fp16",
        device: "webgpu"
      },
      generation_config: {
        do_sample: true,
        max_new_tokens: 1024,
        temperature: 0.2,
        top_p: 0.9
      }
    },
    'Qwen2.5-0.5B-Instruct': {
      model_id: "onnx-community/Qwen2.5-0.5B-Instruct", 
      model_config: {
        dtype: "q4",
        device: "webgpu"
      },
      generation_config: {
        do_sample: false,
        max_new_tokens: 1024
      }
    }
  };

  static async getInstance(model_name, progress_callback = null) {
    if (!this.instances[model_name]) {
      const config = this.MODEL_CONFIGS[model_name];
      if (!config) {
        throw new Error(`Unknown model: ${model_name}`);
      }

      const tokenizer = AutoTokenizer.from_pretrained(config.model_id, {
        progress_callback,
      });

      const model = AutoModelForCausalLM.from_pretrained(config.model_id, {
        ...config.model_config,
        progress_callback,
      });

      this.instances[model_name] = Promise.all([tokenizer, model]);
    }

    return this.instances[model_name];
  }
}

const stopping_criteria = new InterruptableStoppingCriteria();

async function generate(messages, model_name = 'gemma-2-2b-jpn-it') {
  const [tokenizer, model] = await TextGenerationPipeline.getInstance(model_name);
  const config = TextGenerationPipeline.MODEL_CONFIGS[model_name];

  const processedMessages = messages.reduce((acc, msg, index) => {
    if (index === 1 && messages[0].role === 'system') {
      return [{
        role: 'user',
        content: `${messages[0].content}\n\n${msg.content}`
      }];
    } else if (index > 1 || messages[0].role !== 'system') {
      acc.push(msg);
    }
    return acc;
  }, []);

  const inputs = tokenizer.apply_chat_template(processedMessages, {
    add_generation_prompt: true,
    return_dict: true,
  });

  let startTime;
  let numTokens = 0;
  let tps;
  const token_callback_function = () => {
    startTime ??= performance.now();
    if (numTokens++ > 0) {
      tps = (numTokens / (performance.now() - startTime)) * 1000;
    }
  };

  const callback_function = (output) => {
    self.postMessage({
      status: "update",
      output,
      tps,
      numTokens,
    });
  };

  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function,
    token_callback_function,
  });

  self.postMessage({ status: "start" });

  const { past_key_values, sequences } = await model.generate({
    ...inputs,
    ...config.generation_config,
    streamer,
    stopping_criteria,
    return_dict_in_generate: true,
  });

  const decoded = tokenizer.batch_decode(sequences, {
    skip_special_tokens: true,
  });

  self.postMessage({
    status: "complete",
    output: decoded,
  });
}

async function check() {
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("WebGPU is not supported (no adapter found)");
    }
  } catch (e) {
    self.postMessage({
      status: "error",
      data: e.toString(),
    });
  }
}

async function load(model_name = 'gemma-2-2b-jpn-it') {
  self.postMessage({
    status: "loading",
    data: "Loading model...",
  });

  const [tokenizer, model] = await TextGenerationPipeline.getInstance(model_name, (x) => {
    self.postMessage(x);
  });

  self.postMessage({
    status: "loading",
    data: "Compiling shaders and warming up model...",
  });

  const inputs = tokenizer("a");
  await model.generate({ ...inputs, max_new_tokens: 1 });
  self.postMessage({ status: "ready" });
}

self.addEventListener("message", async (e) => {
  const { type, data, model } = e.data;

  switch (type) {
    case "check":
      check();
      break;

    case "load":
      load(model || 'gemma-2-2b-jpn-it');
      break;

    case "generate":
      stopping_criteria.reset();
      generate(data, model || 'gemma-2-2b-jpn-it');
      break;

    case "interrupt":
      stopping_criteria.interrupt();
      break;

    case "reset":
      stopping_criteria.reset();
      break;
  }
});
