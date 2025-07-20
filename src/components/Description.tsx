import { defineComponent } from "vue";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default defineComponent({
  name: 'Description',
  props: {
    description: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <Dialog>
        <DialogTrigger asChild>
          <div class="user-select-none opacity-68 line-clamp-3 mt-6 cursor-pointer text-sm   hover:opacity-88 transition-opacity">
            {props.description}
          </div>
        </DialogTrigger>
        <DialogContent class="bg-white/78 backdrop-blur-sm" overlayClass="bg-white/58">
          <DialogHeader>
            <DialogTitle>
              {props.title}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <p class="text-base mt-4">
              {props.description}
            </p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  },
});