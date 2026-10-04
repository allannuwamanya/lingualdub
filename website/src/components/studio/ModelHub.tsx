import React, { useState, useEffect, useMemo } from 'react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import type { ModelItem } from '../../types/studio';
import { FALLBACK_MODELS } from './models/modelData';
import ModelHubHeaderBanner from './models/ModelHubHeaderBanner';
import ModelStorageTelemetry from './models/ModelStorageTelemetry';
import ModelFilterToolbar from './models/ModelFilterToolbar';
import ModelCard from './models/ModelCard';

export default function ModelHub() {
  const { hardware } = useStudioAudio();
  const [models, setModels] = useState<ModelItem[]>(FALLBACK_MODELS);
  const [pullingModelId, setPullingModelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<string>('All');
  const [installedOnly, setInstalledOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchModels = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/v1/models');
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('json')) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setModels(data.models);
        }
      }
    } catch {}
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handlePullModel = async (modelId: string) => {
    setPullingModelId(modelId);
    try {
      const res = await fetch('/v1/models/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId }),
      });
      if (res.ok) await fetchModels();
    } catch {}
    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) =>
          m.model_id === modelId
            ? { ...m, is_downloaded: true, local_path: `~/.cache/lingualdub/models/${modelId}.bin` }
            : m
        )
      );
      setPullingModelId(null);
    }, 1200);
  };

  const handleRemoveModel = async (modelId: string) => {
    try {
      const res = await fetch('/v1/models/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId }),
      });
      if (res.ok) await fetchModels();
    } catch {}
    setModels((prev) =>
      prev.map((m) => (m.model_id === modelId ? { ...m, is_downloaded: false, local_path: null } : m))
    );
  };

  const totalDiskUsedMb = useMemo(() => {
    return models.filter((m) => m.is_downloaded).reduce((acc, m) => acc + m.size_mb, 0);
  }, [models]);

  const tasksList = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => set.add(m.task));
    return ['All', ...Array.from(set)];
  }, [models]);

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.languages.some((l) => l.toLowerCase().includes(q));

      const matchesTask = selectedTask === 'All' || m.task === selectedTask;
      const matchesInstalled = !installedOnly || m.is_downloaded;

      return matchesSearch && matchesTask && matchesInstalled;
    });
  }, [models, searchQuery, selectedTask, installedOnly]);

  return (
    <div
      className="space-y-6 max-w-[1600px] mx-auto page-fade-in"
      role="region"
      aria-label="Neural Model Hub"
    >
      <ModelHubHeaderBanner
        onRefresh={fetchModels}
        isRefreshing={isRefreshing}
      />

      <ModelStorageTelemetry
        hardware={hardware}
        totalDiskUsedMb={totalDiskUsedMb}
        downloadedCount={models.filter((m) => m.is_downloaded).length}
        totalModelsCount={models.length}
      />

      <ModelFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tasksList={tasksList}
        selectedTask={selectedTask}
        onTaskChange={setSelectedTask}
        installedOnly={installedOnly}
        onInstalledOnlyChange={setInstalledOnly}
      />

      <main
        aria-label="Model Weights Grid"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredModels.map((model) => (
          <ModelCard
            key={model.model_id}
            model={model}
            isPulling={pullingModelId === model.model_id}
            onPull={handlePullModel}
            onRemove={handleRemoveModel}
          />
        ))}
      </main>
    </div>
  );
}
