<script setup>
// 1. 所有的 Import (库依赖在前，本地组件/API 在后)
import { ref, reactive, onMounted } from 'vue'
import { listData } from '@/api/xxx'
import DynamicTable from '@/components/DynamicTable'

// 2. Props 和 Emits 定义 (如果是在子组件中)
// const props = defineProps(...)

// 3. 常量定义 (如 cacheKey, 固定选项映射等)
const cacheKey = '...'

// 4. 定义基础响应式 State (ref, reactive)
const loading = ref(true)
const dataList = ref([])
const queryParams = reactive({ ... })

// 5. Computed 计算属性
// const totalAmount = computed(() => ...)

// 6. 核心业务方法 (一般按功能分组，如查询、新增、删除)
function getList() { ... }
function handleQuery() { ... }
function handleDelete() { ... }

// 7. 生命周期钩子 (onMounted, onActivated 等集中放在底部)
onMounted(() => { getList() })
onActivated(() => { getList() })

// 8. Watch 监听器 (放在最后或贴合相关逻辑)
watch(queryParams, () => { ... })
</script>
