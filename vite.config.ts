import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import fs from 'fs'

// Dev-only plugin: receives slot layout data from the Layout Editor UI
// and writes it directly into ManorScreen.tsx's getDefaultSlots().
function layoutEditorPlugin() {
    const MANOR_FILE = resolve(__dirname, 'src/screens/ManorScreen.tsx');
    return {
        name: 'layout-editor-write',
        configureServer(server: any) {
            server.middlewares.use('/__update-slots', async (req: any, res: any) => {
                if (req.method !== 'POST') {
                    res.statusCode = 405;
                    res.end('Method not allowed');
                    return;
                }
                // Read body
                let body = '';
                for await (const chunk of req) body += chunk;
                try {
                    const { code } = JSON.parse(body);
                    if (!code || typeof code !== 'string') throw new Error('Missing code');

                    const src = fs.readFileSync(MANOR_FILE, 'utf-8');
                    // Match the entire getDefaultSlots function (arrow returning array)
                    const pattern = /( *const getDefaultSlots = \(\): RoomSlot\[\] => \[)[\s\S]*?(\n *\];)/;
                    const match = src.match(pattern);
                    if (!match) throw new Error('Could not find getDefaultSlots in ManorScreen.tsx');

                    const updated = src.replace(pattern, code);
                    fs.writeFileSync(MANOR_FILE, updated, 'utf-8');

                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: true }));
                } catch (err: any) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: false, error: err.message }));
                }
            });
        },
    };
}

export default defineConfig(({ command, mode }) => {
    if (mode != 'lib') {
        return {
            plugins: [react(), layoutEditorPlugin()]
        }
    } else {
        return { plugins: [
                react(),
                dts({
                    outDir: ['dist'],
                    include: ['src/**/*.ts*'],
                    staticImport: true,
                    rollupTypes: true,
                    insertTypesEntry: true,
                }),
            ],
            build: {
                lib: {
                    entry: resolve(__dirname, 'src/index.ts'),
                    name: 'index',
                    formats: ['umd', 'es', 'cjs', 'iife'],
                    fileName: 'index',
                },
                rollupOptions: {
                    external: ['react', 'react-dom'],
                    output: {
                        globals: {
                            react: 'React',
                            'react-dom': 'ReactDOM',
                        },
                    },
                }
            }
        }
    }
});