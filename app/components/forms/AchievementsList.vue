<template>
    <div class="space-y-4">
        <div class="flex justify-between items-center">
            <Label>{{ $t('forms.achievements') }}</Label>
            <Button
                size="sm"
                variant="outline"
                @click="$emit('add')"
            >
                <Plus class="w-4 h-4 mr-2" />
                {{ $t('common.add') }}
            </Button>
        </div>

        <div class="space-y-2">
            <div
                v-for="(achievement, index) in achievements"
                :key="index"
                class="space-y-2"
            >
                <!-- Desktop Layout -->
                <div class="flex items-center space-x-2 md:space-x-2">
                    <Input
                        :model-value="achievement.text"
                        class="flex-1"
                        :placeholder="$t('forms.achievementPlaceholder')"
                        @update:model-value="value => $emit('update', index, value)"
                        @keydown.enter="$emit('add')"
                    />
                    <div class="hidden md:flex items-center space-x-1">
                        <Button
                            :disabled="index === 0"
                            size="sm"
                            variant="outline"
                            @click="$emit('move-up', index)"
                        >
                            <ChevronUp class="w-4 h-4" />
                        </Button>
                        <Button
                            :disabled="index === achievements.length - 1"
                            size="sm"
                            variant="outline"
                            @click="$emit('move-down', index)"
                        >
                            <ChevronDown class="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            @click="$emit('remove', index)"
                        >
                            <Trash2 class="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <!-- Mobile Layout -->
                <div class="flex md:hidden items-center justify-center space-x-2">
                    <Button
                        :disabled="index === 0"
                        size="sm"
                        variant="outline"
                        @click="$emit('move-up', index)"
                    >
                        <ChevronUp class="w-4 h-4" />
                    </Button>
                    <Button
                        :disabled="index === achievements.length - 1"
                        size="sm"
                        variant="outline"
                        @click="$emit('move-down', index)"
                    >
                        <ChevronDown class="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        @click="$emit('remove', index)"
                    >
                        <Trash2 class="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-vue-next';

interface Achievement {
    text: string;
}

defineProps<{
    achievements: Achievement[];
}>();

defineEmits<{
    'add': [];
    'update': [index: number, value: string];
    'remove': [index: number];
    'move-up': [index: number];
    'move-down': [index: number];
}>();
</script>
