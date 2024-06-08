<script lang="ts">
  import { LogMessage, LogMessageType } from '../types'

  export let message: LogMessage
</script>

<div
  class="text-[12px] leading-[18px] even:bg-gray-100 px-2"
  class:text-red-500={message.type === LogMessageType.ERROR}
  class:text-yellow-400={message.type === LogMessageType.WARNING}
>
  {message.message}
</div>
